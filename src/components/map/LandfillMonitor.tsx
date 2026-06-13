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
import { useMapStore, type LandfillMonitorState, type LandfillSite } from '@/lib/map-store'
import { Trash2, X, Gauge, Cloud, AlertTriangle, RotateCcw, Filter, MapPin } from 'lucide-react'

const DEMO_SITES: LandfillSite[] = [
  {
    id: 'lf-freshkills',
    name: 'Fresh Kills Landfill',
    latitude: 40.58,
    longitude: -74.19,
    capacity: 89000000,
    currentFill: 72,
    methaneOutput: 12.4,
    leachateRisk: 'moderate',
    wasteType: 'Municipal Solid Waste',
    yearsRemaining: 3,
    recyclingRate: 34,
  },
  {
    id: 'lf-puente-hills',
    name: 'Puente Hills',
    latitude: 34.02,
    longitude: -117.97,
    capacity: 64000000,
    currentFill: 95,
    methaneOutput: 18.6,
    leachateRisk: 'high',
    wasteType: 'Mixed Waste',
    yearsRemaining: 1,
    recyclingRate: 22,
  },
  {
    id: 'lf-apex',
    name: 'Apex Regional',
    latitude: 36.28,
    longitude: -114.92,
    capacity: 120000000,
    currentFill: 38,
    methaneOutput: 6.2,
    leachateRisk: 'low',
    wasteType: 'Construction & Municipal',
    yearsRemaining: 15,
    recyclingRate: 48,
  },
  {
    id: 'lf-olusosun',
    name: 'Olusosun Dump',
    latitude: 6.53,
    longitude: 3.37,
    capacity: 42000000,
    currentFill: 88,
    methaneOutput: 22.8,
    leachateRisk: 'critical',
    wasteType: 'Unsorted Waste',
    yearsRemaining: 2,
    recyclingRate: 8,
  },
  {
    id: 'lf-bordo-poniente',
    name: 'Bordo Poniente',
    latitude: 19.37,
    longitude: -99.08,
    capacity: 76000000,
    currentFill: 80,
    methaneOutput: 15.3,
    leachateRisk: 'high',
    wasteType: 'Municipal Waste',
    yearsRemaining: 4,
    recyclingRate: 15,
  },
  {
    id: 'lf-jordan-valley',
    name: 'Jordan Valley Site',
    latitude: 31.95,
    longitude: 35.93,
    capacity: 28000000,
    currentFill: 45,
    methaneOutput: 4.8,
    leachateRisk: 'low',
    wasteType: 'Sorted Municipal',
    yearsRemaining: 10,
    recyclingRate: 52,
  },
]

const LEACHATE_CONFIG: Record<
  LandfillSite['leachateRisk'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function LandfillMonitor() {
  const landfillMonitor = useMapStore((s) => s.landfillMonitor)
  const setLandfillMonitor = useMapStore((s) => s.setLandfillMonitor)

  const sites = useMemo(
    () => (landfillMonitor.sites.length > 0 ? landfillMonitor.sites : DEMO_SITES),
    [landfillMonitor.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (landfillMonitor.leachateFilter !== 'all' && s.leachateRisk !== landfillMonitor.leachateFilter) return false
      return true
    })
  }, [sites, landfillMonitor.leachateFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalCapacity: 0, highCriticalCount: 0, avgRecyclingRate: 0 }
    }
    const totalCapacity = filteredSites.reduce((sum, s) => sum + s.capacity, 0)
    const highCriticalCount = filteredSites.filter(
      (s) => s.leachateRisk === 'high' || s.leachateRisk === 'critical'
    ).length
    const avgRecyclingRate =
      filteredSites.reduce((sum, s) => sum + s.recyclingRate, 0) / filteredSites.length
    return {
      totalCapacity,
      highCriticalCount,
      avgRecyclingRate: Math.round(avgRecyclingRate * 10) / 10,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === landfillMonitor.activeSiteId) ?? null,
    [sites, landfillMonitor.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!landfillMonitor.open) return null

  const overlayToggles: { key: keyof LandfillMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFill', label: 'Fill Level', icon: Gauge },
    { key: 'showMethane', label: 'Methane', icon: Cloud },
    { key: 'showLeachate', label: 'Leachate Risk', icon: AlertTriangle },
    { key: 'showRecycling', label: 'Recycling', icon: RotateCcw },
  ]

  const formatCapacity = (cap: number) => {
    if (cap >= 1000000) return `${(cap / 1000000).toFixed(0)}M`
    if (cap >= 1000) return `${(cap / 1000).toFixed(0)}K`
    return cap.toString()
  }

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-amber-500" />
              Landfill Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLandfillMonitor({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Leachate Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Leachate Risk
            </Label>
            <Select
              value={landfillMonitor.leachateFilter}
              onValueChange={(v) =>
                setLandfillMonitor({
                  leachateFilter: v as LandfillMonitorState['leachateFilter'],
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
                <SelectItem value="critical">Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={landfillMonitor[key] as boolean}
                  onCheckedChange={(checked) => setLandfillMonitor({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Capacity</div>
              <div className="text-sm font-semibold">{formatCapacity(summary.totalCapacity)}</div>
              <div className="text-[9px] text-muted-foreground">tons</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Critical</div>
              <div className="text-sm font-semibold text-red-500">{summary.highCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Recycling</div>
              <div className="text-sm font-semibold text-amber-500">{summary.avgRecyclingRate}%</div>
              <div className="text-[9px] text-muted-foreground">rate</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Landfill Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = landfillMonitor.activeSiteId === site.id
                  const leachCfg = LEACHATE_CONFIG[site.leachateRisk]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setLandfillMonitor({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: leachCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${leachCfg.bgClass}`}
                        >
                          {leachCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {landfillMonitor.showFill && (
                          <div>
                            Fill:{' '}
                            <span className="text-foreground font-medium">
                              {site.currentFill}%
                            </span>
                          </div>
                        )}
                        {landfillMonitor.showMethane && (
                          <div>
                            Methane:{' '}
                            <span className="text-foreground font-medium">
                              {site.methaneOutput} t/day
                            </span>
                          </div>
                        )}
                        {landfillMonitor.showLeachate && (
                          <div>
                            Leachate:{' '}
                            <span className="text-foreground font-medium">
                              {leachCfg.label}
                            </span>
                          </div>
                        )}
                        {landfillMonitor.showRecycling && (
                          <div>
                            Recycle:{' '}
                            <span className="text-foreground font-medium">
                              {site.recyclingRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${LEACHATE_CONFIG[activeSite.leachateRisk].bgClass}`}
                  >
                    {LEACHATE_CONFIG[activeSite.leachateRisk].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSite.latitude.toFixed(2)}, {activeSite.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fill Level: </span>
                    <span className="font-medium">{activeSite.currentFill}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity: </span>
                    <span className="font-medium">{formatCapacity(activeSite.capacity)} tons</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Methane: </span>
                    <span className="font-medium">{activeSite.methaneOutput} t/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waste Type: </span>
                    <span className="font-medium">{activeSite.wasteType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Years Left: </span>
                    <span className="font-medium">{activeSite.yearsRemaining}</span>
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
