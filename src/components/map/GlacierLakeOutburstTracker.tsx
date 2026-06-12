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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type GLOFSite, type GLOFState } from '@/lib/map-store'
import { Mountain, X, AlertTriangle, Users, Filter, MapPin } from 'lucide-react'

const SAMPLE_SITES: GLOFSite[] = [
  {
    id: 'glof-1',
    name: 'Imja Lake, Nepal',
    latitude: 27.9,
    longitude: 86.93,
    lakeVolume: 75.3,
    damType: 'moraine',
    damStability: 'critical',
    downstreamPopulation: 5200,
    lastOutburst: null,
    riskLevel: 'very_high',
  },
  {
    id: 'glof-2',
    name: 'Tsho Rolpa, Nepal',
    latitude: 27.87,
    longitude: 86.48,
    lakeVolume: 110.0,
    damType: 'moraine',
    damStability: 'weakening',
    downstreamPopulation: 12500,
    lastOutburst: null,
    riskLevel: 'high',
  },
  {
    id: 'glof-3',
    name: 'Merzbacher Lake, Kyrgyzstan',
    latitude: 42.0,
    longitude: 79.8,
    lakeVolume: 280.0,
    damType: 'ice',
    damStability: 'critical',
    downstreamPopulation: 3200,
    lastOutburst: '2012-07-17',
    riskLevel: 'high',
  },
  {
    id: 'glof-4',
    name: 'Laguna Parón, Peru',
    latitude: -8.98,
    longitude: -77.68,
    lakeVolume: 55.0,
    damType: 'moraine',
    damStability: 'stable',
    downstreamPopulation: 8800,
    lastOutburst: null,
    riskLevel: 'moderate',
  },
  {
    id: 'glof-5',
    name: 'Lago Cachet Dos, Chile',
    latitude: -47.1,
    longitude: -73.0,
    lakeVolume: 200.0,
    damType: 'ice',
    damStability: 'weakening',
    downstreamPopulation: 1500,
    lastOutburst: '2017-03-28',
    riskLevel: 'high',
  },
  {
    id: 'glof-6',
    name: 'Dig Tsho, Nepal',
    latitude: 27.87,
    longitude: 86.6,
    lakeVolume: 32.0,
    damType: 'moraine',
    damStability: 'breached',
    downstreamPopulation: 4100,
    lastOutburst: '1985-08-04',
    riskLevel: 'moderate',
  },
]

const RISK_CONFIG: Record<
  GLOFSite['riskLevel'],
  { bg: string; text: string; border: string; dot: string }
> = {
  low: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
  moderate: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  very_high: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
}

const DAM_TYPE_CONFIG: Record<GLOFSite['damType'], { bg: string; text: string; border: string }> = {
  moraine: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
  },
  ice: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
  },
  bedrock: {
    bg: 'bg-stone-100 dark:bg-stone-900/30',
    text: 'text-stone-800 dark:text-stone-300',
    border: 'border-stone-300 dark:border-stone-700',
  },
}

const STABILITY_CONFIG: Record<
  GLOFSite['damStability'],
  { bg: string; text: string; border: string }
> = {
  stable: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
  },
  weakening: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  critical: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
  },
  breached: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
  },
}

export default function GlacierLakeOutburstTracker() {
  const glof = useMapStore((s) => s.glof)
  const setGLOF = useMapStore((s) => s.setGLOF)

  const sites = useMemo(() => {
    const source = glof.glofSites.length > 0 ? glof.glofSites : SAMPLE_SITES
    return source
  }, [glof.glofSites])

  const filteredSites = useMemo(() => {
    let result = sites
    if (glof.riskFilter !== 'all') {
      result = result.filter((s) => s.riskLevel === glof.riskFilter)
    }
    return result
  }, [sites, glof.riskFilter])

  const selectedSite = useMemo(() => {
    if (!glof.activeSiteId) return null
    return sites.find((s) => s.id === glof.activeSiteId) ?? null
  }, [sites, glof.activeSiteId])

  const summary = useMemo(() => {
    const totalVolume = sites.reduce((sum, s) => sum + s.lakeVolume, 0)
    const criticalCount = sites.filter(
      (s) => s.damStability === 'critical' || s.damStability === 'breached'
    ).length
    const totalPopAtRisk = sites.reduce((sum, s) => sum + s.downstreamPopulation, 0)
    return { totalVolume, criticalCount, totalPopAtRisk }
  }, [sites])

  if (!glof.open) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Glacier Lake Outburst Tracker</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setGLOF({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Total Vol.</p>
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                {summary.totalVolume.toFixed(0)}M
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.criticalCount}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Pop. at Risk</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {summary.totalPopAtRisk.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Display Options
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="glof-show-volume"
                  checked={glof.showVolume}
                  onCheckedChange={(v) => setGLOF({ showVolume: v })}
                />
                <Label htmlFor="glof-show-volume" className="text-xs cursor-pointer">
                  Lake Volume
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="glof-show-stability"
                  checked={glof.showStability}
                  onCheckedChange={(v) => setGLOF({ showStability: v })}
                />
                <Label htmlFor="glof-show-stability" className="text-xs cursor-pointer">
                  Dam Stability
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="glof-show-risk"
                  checked={glof.showRisk}
                  onCheckedChange={(v) => setGLOF({ showRisk: v })}
                />
                <Label htmlFor="glof-show-risk" className="text-xs cursor-pointer">
                  Risk Level
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="glof-show-pop"
                  checked={glof.showPopulation}
                  onCheckedChange={(v) => setGLOF({ showPopulation: v })}
                />
                <Label htmlFor="glof-show-pop" className="text-xs cursor-pointer">
                  Population
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Risk Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Risk
              </p>
            </div>
            <Select
              value={glof.riskFilter}
              onValueChange={(v) =>
                setGLOF({
                  riskFilter: v as GLOFState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All risk levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              GLOF Sites ({filteredSites.length})
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredSites.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No sites match the current filter.
                </p>
              )}
              {filteredSites.map((site) => {
                const rc = RISK_CONFIG[site.riskLevel]
                const dtc = DAM_TYPE_CONFIG[site.damType]
                const dsc = STABILITY_CONFIG[site.damStability]
                const isSelected = glof.activeSiteId === site.id
                return (
                  <button
                    key={site.id}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() =>
                      setGLOF({
                        activeSiteId: isSelected ? null : site.id,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${rc.dot}`} />
                        <span className="text-sm font-medium truncate">{site.name}</span>
                      </div>
                      {glof.showRisk && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${rc.bg} ${rc.text} ${rc.border}`}
                        >
                          {site.riskLevel === 'very_high' ? 'Very High' : site.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {glof.showVolume && (
                        <span className="flex items-center gap-0.5">
                          <Mountain className="h-3 w-3" />
                          {site.lakeVolume.toFixed(1)}M m³
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1 py-0 ${dtc.bg} ${dtc.text} ${dtc.border}`}
                      >
                        {site.damType}
                      </Badge>
                      {glof.showStability && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1 py-0 ${dsc.bg} ${dsc.text} ${dsc.border}`}
                        >
                          {site.damStability}
                        </Badge>
                      )}
                      {glof.showPopulation && (
                        <span className="flex items-center gap-0.5">
                          <Users className="h-3 w-3" />
                          {site.downstreamPopulation.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Site Details */}
          {selectedSite && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{selectedSite.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Lake Volume
                    </p>
                    <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {selectedSite.lakeVolume.toFixed(1)}M m³
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Risk Level
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${RISK_CONFIG[selectedSite.riskLevel].bg} ${RISK_CONFIG[selectedSite.riskLevel].text} ${RISK_CONFIG[selectedSite.riskLevel].border}`}
                    >
                      {selectedSite.riskLevel === 'very_high' ? 'Very High' : selectedSite.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Dam Type
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${DAM_TYPE_CONFIG[selectedSite.damType].bg} ${DAM_TYPE_CONFIG[selectedSite.damType].text} ${DAM_TYPE_CONFIG[selectedSite.damType].border}`}
                    >
                      {selectedSite.damType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Dam Stability
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${STABILITY_CONFIG[selectedSite.damStability].bg} ${STABILITY_CONFIG[selectedSite.damStability].text} ${STABILITY_CONFIG[selectedSite.damStability].border}`}
                    >
                      {selectedSite.damStability === 'critical' && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {selectedSite.damStability}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Downstream Pop.
                    </p>
                    <p className="text-sm font-medium">
                      {selectedSite.downstreamPopulation.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Last Outburst
                    </p>
                    <p className="text-sm font-medium">
                      {selectedSite.lastOutburst ?? 'None recorded'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSite.latitude.toFixed(2)}°,{' '}
                    {selectedSite.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
