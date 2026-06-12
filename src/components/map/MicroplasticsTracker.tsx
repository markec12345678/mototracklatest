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
import { useMapStore, type MicroplasticsState, type MicroplasticsSample } from '@/lib/map-store'
import { Search, X, Activity, TestTube, MapPin, AlertTriangle, Filter } from 'lucide-react'

const DEMO_SAMPLES: MicroplasticsSample[] = [
  {
    id: 'mp-pacific',
    name: 'Pacific Gyre Sample',
    latitude: 30.0,
    longitude: -155.0,
    concentration: 320,
    particleSize: '<5mm',
    polymerType: 'PE',
    source: 'Packaging debris',
    severity: 'high',
    waterDepth: 5,
  },
  {
    id: 'mp-northsea',
    name: 'North Sea Coastal',
    latitude: 54.5,
    longitude: 4.0,
    concentration: 85,
    particleSize: '1-5mm',
    polymerType: 'PP',
    source: 'Fishing gear',
    severity: 'moderate',
    waterDepth: 12,
  },
  {
    id: 'mp-mediterranean',
    name: 'Mediterranean Basin',
    latitude: 35.5,
    longitude: 18.0,
    concentration: 410,
    particleSize: '<1mm',
    polymerType: 'PS',
    source: 'Urban runoff',
    severity: 'extreme',
    waterDepth: 3,
  },
  {
    id: 'mp-atlantic',
    name: 'North Atlantic Deep',
    latitude: 48.0,
    longitude: -25.0,
    concentration: 28,
    particleSize: '<1mm',
    polymerType: 'PET',
    source: 'Textile fibers',
    severity: 'low',
    waterDepth: 200,
  },
  {
    id: 'mp-indian',
    name: 'Indian Ocean Surface',
    latitude: -10.0,
    longitude: 72.0,
    concentration: 195,
    particleSize: '1-5mm',
    polymerType: 'PVC',
    source: 'Industrial discharge',
    severity: 'high',
    waterDepth: 8,
  },
  {
    id: 'mp-arctic',
    name: 'Arctic Ice Sample',
    latitude: 78.0,
    longitude: 15.0,
    concentration: 42,
    particleSize: '<1mm',
    polymerType: 'Nylon',
    source: 'Atmospheric deposition',
    severity: 'moderate',
    waterDepth: 50,
  },
]

const SEVERITY_CONFIG: Record<
  MicroplasticsSample['severity'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function MicroplasticsTracker() {
  const microplastics = useMapStore((s) => s.microplastics)
  const setMicroplastics = useMapStore((s) => s.setMicroplastics)

  const samples = useMemo(
    () => (microplastics.samples.length > 0 ? microplastics.samples : DEMO_SAMPLES),
    [microplastics.samples]
  )

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (microplastics.severityFilter !== 'all' && s.severity !== microplastics.severityFilter) return false
      return true
    })
  }, [samples, microplastics.severityFilter])

  const summary = useMemo(() => {
    if (filteredSamples.length === 0) {
      return { avgConcentration: 0, highExtremeCount: 0, totalSamples: 0 }
    }
    const avgConcentration =
      filteredSamples.reduce((sum, s) => sum + s.concentration, 0) / filteredSamples.length
    const highExtremeCount = filteredSamples.filter(
      (s) => s.severity === 'high' || s.severity === 'extreme'
    ).length
    return {
      avgConcentration: Math.round(avgConcentration * 10) / 10,
      highExtremeCount,
      totalSamples: filteredSamples.length,
    }
  }, [filteredSamples])

  const activeSample = useMemo(
    () => samples.find((s) => s.id === microplastics.activeSampleId) ?? null,
    [samples, microplastics.activeSampleId]
  )

  if (typeof window === 'undefined') return null
  if (!microplastics.open) return null

  const overlayToggles: { key: keyof MicroplasticsState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Activity },
    { key: 'showPolymerType', label: 'Polymer Type', icon: TestTube },
    { key: 'showSource', label: 'Source', icon: MapPin },
    { key: 'showSeverity', label: 'Severity', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-pink-500" />
              Microplastics Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMicroplastics({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={microplastics.severityFilter}
              onValueChange={(v) =>
                setMicroplastics({
                  severityFilter: v as MicroplasticsState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
                  <Icon className="h-3 w-3 text-pink-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={microplastics[key] as boolean}
                  onCheckedChange={(checked) => setMicroplastics({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Concentration</div>
              <div className="text-sm font-semibold">{summary.avgConcentration}</div>
              <div className="text-[9px] text-muted-foreground">particles/L</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">samples</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Samples</div>
              <div className="text-sm font-semibold text-orange-500">{summary.totalSamples}</div>
              <div className="text-[9px] text-muted-foreground">collected</div>
            </div>
          </div>

          <Separator />

          {/* Sample List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Microplastic Samples ({filteredSamples.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSamples.map((sample) => {
                  const isActive = microplastics.activeSampleId === sample.id
                  const sevCfg = SEVERITY_CONFIG[sample.severity]
                  return (
                    <div
                      key={sample.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-500/5'
                          : 'border-border/40 hover:border-pink-500/20 hover:bg-pink-500/5'
                      }`}
                      onClick={() =>
                        setMicroplastics({
                          activeSampleId: isActive ? null : sample.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sevCfg.color }}
                          />
                          <span className="text-xs font-medium">{sample.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sevCfg.bgClass}`}
                        >
                          {sevCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {microplastics.showConcentration && (
                          <div>
                            Conc:{' '}
                            <span className="text-foreground font-medium">
                              {sample.concentration} p/L
                            </span>
                          </div>
                        )}
                        {microplastics.showPolymerType && (
                          <div>
                            Polymer:{' '}
                            <span className="text-foreground font-medium">
                              {sample.polymerType}
                            </span>
                          </div>
                        )}
                        {microplastics.showSource && (
                          <div>
                            Source:{' '}
                            <span className="text-foreground font-medium">
                              {sample.source}
                            </span>
                          </div>
                        )}
                        {microplastics.showSeverity && (
                          <div>
                            Size:{' '}
                            <span className="text-foreground font-medium">
                              {sample.particleSize}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSamples.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No samples match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Sample Details */}
          {activeSample && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-pink-500/20 bg-pink-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-pink-500" />
                  <span className="text-xs font-semibold">{activeSample.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeSample.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeSample.severity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSample.latitude.toFixed(2)}, {activeSample.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activeSample.concentration} p/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Particle Size: </span>
                    <span className="font-medium">{activeSample.particleSize}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Polymer Type: </span>
                    <span className="font-medium">{activeSample.polymerType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source: </span>
                    <span className="font-medium">{activeSample.source}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Depth: </span>
                    <span className="font-medium">{activeSample.waterDepth} m</span>
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
