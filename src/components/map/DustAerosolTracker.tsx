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
import { useMapStore, type DustAerosolState, type DustAerosolSource } from '@/lib/map-store'
import { CloudFog as CloudFogIcon, X, Wind, Eye, Route, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_SOURCES: DustAerosolSource[] = [
  {
    id: 'da-bodele',
    name: 'Sahara Bodélé Depression',
    latitude: 16.50,
    longitude: 18.00,
    dustConcentration: 1200,
    aerosolOpticalDepth: 3.2,
    particleSize: 'clay',
    transportDistance: 5000,
    depositionRate: 85,
    ironContent: 6.2,
    impactLevel: 'extreme',
  },
  {
    id: 'da-gobi',
    name: 'Gobi Desert',
    latitude: 43.00,
    longitude: 105.00,
    dustConcentration: 650,
    aerosolOpticalDepth: 1.8,
    particleSize: 'silt',
    transportDistance: 3000,
    depositionRate: 55,
    ironContent: 3.8,
    impactLevel: 'severe',
  },
  {
    id: 'da-taklamakan',
    name: 'Taklamakan Desert',
    latitude: 39.50,
    longitude: 82.00,
    dustConcentration: 800,
    aerosolOpticalDepth: 2.4,
    particleSize: 'fine_sand',
    transportDistance: 4000,
    depositionRate: 70,
    ironContent: 4.5,
    impactLevel: 'severe',
  },
  {
    id: 'da-arabian',
    name: 'Arabian Peninsula',
    latitude: 23.00,
    longitude: 48.00,
    dustConcentration: 500,
    aerosolOpticalDepth: 1.5,
    particleSize: 'coarse',
    transportDistance: 2500,
    depositionRate: 45,
    ironContent: 2.9,
    impactLevel: 'high',
  },
  {
    id: 'da-sahel',
    name: 'Sahel Dust Belt',
    latitude: 14.00,
    longitude: 0.00,
    dustConcentration: 350,
    aerosolOpticalDepth: 1.1,
    particleSize: 'mixed',
    transportDistance: 4500,
    depositionRate: 60,
    ironContent: 5.1,
    impactLevel: 'moderate',
  },
  {
    id: 'da-patagonia',
    name: 'Patagonia',
    latitude: -47.00,
    longitude: -68.00,
    dustConcentration: 150,
    aerosolOpticalDepth: 0.5,
    particleSize: 'silt',
    transportDistance: 1500,
    depositionRate: 20,
    ironContent: 1.5,
    impactLevel: 'low',
  },
]

const IMPACT_CONFIG: Record<
  DustAerosolSource['impactLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  extreme: { label: 'Extreme', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

const PARTICLE_SIZE_CONFIG: Record<
  DustAerosolSource['particleSize'],
  { label: string }
> = {
  clay: { label: 'Clay' },
  silt: { label: 'Silt' },
  fine_sand: { label: 'Fine Sand' },
  coarse: { label: 'Coarse' },
  mixed: { label: 'Mixed' },
}

export function DustAerosolTracker() {
  const state = useMapStore((s) => s.dustAerosol)
  const setState = useMapStore((s) => s.setDustAerosol)

  const sources = useMemo(
    () => (state.sources.length > 0 ? state.sources : DEMO_SOURCES),
    [state.sources]
  )

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (state.impactFilter !== 'all' && s.impactLevel !== state.impactFilter) return false
      return true
    })
  }, [sources, state.impactFilter])

  const summary = useMemo(() => {
    if (filteredSources.length === 0) {
      return { avgConcentration: 0, avgOpticalDepth: 0, severeCount: 0 }
    }
    const avgConcentration = filteredSources.reduce((sum, s) => sum + s.dustConcentration, 0) / filteredSources.length
    const avgOpticalDepth = filteredSources.reduce((sum, s) => sum + s.aerosolOpticalDepth, 0) / filteredSources.length
    const severeCount = filteredSources.filter(
      (s) => s.impactLevel === 'severe' || s.impactLevel === 'extreme'
    ).length
    return {
      avgConcentration: Math.round(avgConcentration),
      avgOpticalDepth: Math.round(avgOpticalDepth * 100) / 100,
      severeCount,
    }
  }, [filteredSources])

  const activeSource = useMemo(
    () => sources.find((s) => s.id === state.activeSourceId) ?? null,
    [sources, state.activeSourceId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DustAerosolState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConcentration', label: 'Concentration', icon: Wind },
    { key: 'showOpticalDepth', label: 'Optical Depth', icon: Eye },
    { key: 'showTransportDistance', label: 'Transport Distance', icon: Route },
    { key: 'showImpactLevel', label: 'Impact Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudFogIcon className="h-4 w-4 text-amber-700" />
              Dust & Aerosol Tracker
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
          {/* Impact Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Impact Level
            </Label>
            <Select
              value={state.impactFilter}
              onValueChange={(v) =>
                setState({
                  impactFilter: v as DustAerosolState['impactFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-700" />
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
              <div className="text-[10px] text-muted-foreground">Avg Conc.</div>
              <div className="text-sm font-semibold">{summary.avgConcentration}</div>
              <div className="text-[9px] text-muted-foreground">µg/m³</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg AOD</div>
              <div className="text-sm font-semibold text-amber-700">{summary.avgOpticalDepth}</div>
              <div className="text-[9px] text-muted-foreground">optical depth</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.severeCount}</div>
              <div className="text-[9px] text-muted-foreground">sources</div>
            </div>
          </div>

          <Separator />

          {/* Source List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Dust Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = state.activeSourceId === source.id
                  const impactCfg = IMPACT_CONFIG[source.impactLevel]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSourceId: isActive ? null : source.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: impactCfg.color }}
                          />
                          <span className="text-xs font-medium">{source.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${impactCfg.bgClass}`}
                        >
                          {impactCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showConcentration && (
                          <div>
                            Conc.: <span className="text-foreground font-medium">{source.dustConcentration} µg/m³</span>
                          </div>
                        )}
                        {state.showOpticalDepth && (
                          <div>
                            AOD: <span className="text-foreground font-medium">{source.aerosolOpticalDepth}</span>
                          </div>
                        )}
                        {state.showTransportDistance && (
                          <div>
                            Transport: <span className="text-foreground font-medium">{source.transportDistance} km</span>
                          </div>
                        )}
                        {state.showImpactLevel && (
                          <div>
                            Particle: <span className="text-foreground font-medium">{PARTICLE_SIZE_CONFIG[source.particleSize].label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSources.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sources match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Source Details */}
          {activeSource && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-700" />
                  <span className="text-xs font-semibold">{activeSource.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${IMPACT_CONFIG[activeSource.impactLevel].bgClass}`}
                  >
                    {IMPACT_CONFIG[activeSource.impactLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSource.latitude.toFixed(2)}, {activeSource.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activeSource.dustConcentration} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Optical Depth: </span>
                    <span className="font-medium">{activeSource.aerosolOpticalDepth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Particle Size: </span>
                    <span className="font-medium">{PARTICLE_SIZE_CONFIG[activeSource.particleSize].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transport: </span>
                    <span className="font-medium">{activeSource.transportDistance} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deposition Rate: </span>
                    <span className="font-medium">{activeSource.depositionRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Iron Content: </span>
                    <span className="font-medium">{activeSource.ironContent}%</span>
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
