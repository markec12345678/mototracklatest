'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type CoastalAcidificationState, type CoastalAcidificationData } from '@/lib/map-store'
import { Droplets as DropletsIcon8, X, Layers, Activity, FlaskConical, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: CoastalAcidificationData[] = [
  {
    id: 'ca-pacific-nw',
    name: 'Pacific NW Shellfish',
    lat: 47.5,
    lng: -124.0,
    ph: 7.6,
    carbonDioxide: 800,
    aragoniteSaturation: 1.2,
    severity: 'severe',
    shellfishImpact: 0.85,
    description: 'Shellfish industry threatened by acidification',
  },
  {
    id: 'ca-gulf-maine',
    name: 'Gulf of Maine',
    lat: 43.5,
    lng: -69.0,
    ph: 7.7,
    carbonDioxide: 650,
    aragoniteSaturation: 1.5,
    severity: 'moderate',
    shellfishImpact: 0.55,
    description: 'Rapidly acidifying coastal waters',
  },
  {
    id: 'ca-baltic',
    name: 'Baltic Coast',
    lat: 55.0,
    lng: 14.0,
    ph: 7.5,
    carbonDioxide: 900,
    aragoniteSaturation: 0.9,
    severity: 'extreme',
    shellfishImpact: 0.92,
    description: 'Critical acidification in semi-enclosed sea',
  },
  {
    id: 'ca-coral-sea',
    name: 'Coral Sea Edge',
    lat: -18.0,
    lng: 147.5,
    ph: 7.9,
    carbonDioxide: 450,
    aragoniteSaturation: 2.8,
    severity: 'mild',
    shellfishImpact: 0.25,
    description: 'Early-stage coastal acidification',
  },
]

const SEVERITY_COLORS: Record<CoastalAcidificationData['severity'], { label: string; color: string; bgClass: string }> = {
  mild: { label: 'Mild', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ severity }: { severity: CoastalAcidificationData['severity'] }) {
  const cfg = SEVERITY_COLORS[severity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CoastalAcidificationMonitor() {
  const state = useMapStore((s) => s.coastalAcidification)
  const setState = useMapStore((s) => s.setCoastalAcidification)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.severityFilter !== 'all' && s.severity !== state.severityFilter) return false
      return true
    })
  }, [sites, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalSites: 0, avgPH: 0, avgCO2: 0, avgAragonite: 0 }
    }
    const avgPH = filteredSites.reduce((sum, s) => sum + s.ph, 0) / filteredSites.length
    const avgCO2 = filteredSites.reduce((sum, s) => sum + s.carbonDioxide, 0) / filteredSites.length
    const avgAragonite = filteredSites.reduce((sum, s) => sum + s.aragoniteSaturation, 0) / filteredSites.length
    return {
      totalSites: filteredSites.length,
      avgPH: Math.round(avgPH * 100) / 100,
      avgCO2: Math.round(avgCO2),
      avgAragonite: Math.round(avgAragonite * 10) / 10,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSites.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, severity: s.severity, ph: s.ph },
    })),
  }), [filteredSites])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setCoastalAcidification({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalAcidificationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPH', label: 'pH Level', icon: FlaskConical },
    { key: 'showCarbonDioxide', label: 'CO₂ Level', icon: Activity },
    { key: 'showSaturation', label: 'Aragonite Saturation', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <DropletsIcon8 className="h-4 w-4 text-cyan-400" />
              Coastal Acidification Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as CoastalAcidificationState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSites}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg pH</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgPH}</div>
              <div className="text-[9px] text-cyan-400/60">pH units</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg CO₂</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgCO2}</div>
              <div className="text-[9px] text-cyan-400/60">μatm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Aragonite Saturation</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgAragonite}</div>
              <div className="text-[9px] text-cyan-400/60">Ω aragonite</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const sevCfg = SEVERITY_COLORS[site.severity]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : site.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon severity={site.severity} />
                          <span className="text-xs font-medium text-cyan-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sevCfg.bgClass}`}
                        >
                          {sevCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showPH && (
                          <div>
                            pH:{' '}
                            <span className="text-cyan-100 font-medium">{site.ph}</span>
                          </div>
                        )}
                        {state.showCarbonDioxide && (
                          <div>
                            CO₂:{' '}
                            <span className="text-cyan-100 font-medium">{site.carbonDioxide}μatm</span>
                          </div>
                        )}
                        {state.showSaturation && (
                          <div>
                            Ω Aragonite:{' '}
                            <span className="text-cyan-100 font-medium">{site.aragoniteSaturation}</span>
                          </div>
                        )}
                        <div>
                            Shellfish Impact:{' '}
                            <span className="text-orange-400 font-medium">{(site.shellfishImpact * 100).toFixed(0)}%</span>
                          </div>
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_COLORS[activeSite.severity].bgClass}`}
                  >
                    {SEVERITY_COLORS[activeSite.severity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeSite.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">pH: </span>
                    <span className="font-medium text-orange-400">{activeSite.ph}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">CO₂: </span>
                    <span className="font-medium text-cyan-100">{activeSite.carbonDioxide}μatm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Aragonite: </span>
                    <span className="font-medium text-cyan-100">{activeSite.aragoniteSaturation} Ω</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Shellfish Impact: </span>
                    <span className="font-medium text-orange-400">{(activeSite.shellfishImpact * 100).toFixed(0)}%</span>
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
