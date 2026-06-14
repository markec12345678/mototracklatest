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
import { useMapStore, type GlacierMassBalanceState, type GlacierMassBalance } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon2, X, MapPin, Filter, TrendingDown, Droplets, Activity } from 'lucide-react'

const DEMO_GLACIERS: GlacierMassBalance[] = [
  {
    id: 'gmb-alps',
    name: 'Aletsch Glacier',
    latitude: 46.53,
    longitude: 8.08,
    massBalance: -1.2,
    accumulation: 1.8,
    ablation: 3.0,
    equilibriumLineAltitude: 2950,
    glacierType: 'valley',
    healthStatus: 'retreating',
    waterContribution: 0.45,
  },
  {
    id: 'gmb-greenland',
    name: 'Jakobshavn Isbræ',
    latitude: 69.17,
    longitude: -49.80,
    massBalance: -3.5,
    accumulation: 2.1,
    ablation: 5.6,
    equilibriumLineAltitude: 1550,
    glacierType: 'tidewater',
    healthStatus: 'collapsing',
    waterContribution: 1.82,
  },
  {
    id: 'gmb-iceland',
    name: 'Vatnajökull Ice Cap',
    latitude: 64.42,
    longitude: -16.80,
    massBalance: -0.8,
    accumulation: 2.5,
    ablation: 3.3,
    equilibriumLineAltitude: 1100,
    glacierType: 'ice_cap',
    healthStatus: 'retreating',
    waterContribution: 0.92,
  },
  {
    id: 'gmb-alaska',
    name: 'Malaspina Glacier',
    latitude: 59.95,
    longitude: -140.75,
    massBalance: -0.3,
    accumulation: 2.8,
    ablation: 3.1,
    equilibriumLineAltitude: 900,
    glacierType: 'piedmont',
    healthStatus: 'stable',
    waterContribution: 0.38,
  },
  {
    id: 'gmb-himalaya',
    name: 'Khumbu Glacier',
    latitude: 27.97,
    longitude: 86.83,
    massBalance: -0.6,
    accumulation: 1.4,
    ablation: 2.0,
    equilibriumLineAltitude: 5600,
    glacierType: 'valley',
    healthStatus: 'retreating',
    waterContribution: 0.21,
  },
  {
    id: 'gmb-norway',
    name: 'Briksdalsbreen',
    latitude: 61.67,
    longitude: 6.87,
    massBalance: 0.2,
    accumulation: 3.2,
    ablation: 3.0,
    equilibriumLineAltitude: 1450,
    glacierType: 'hanging',
    healthStatus: 'advancing',
    waterContribution: 0.15,
  },
]

const HEALTH_CONFIG: Record<
  GlacierMassBalance['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  advancing: { label: 'Advancing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  retreating: { label: 'Retreating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GlacierMassBalanceMonitor() {
  const glacierMassBalance = useMapStore((s) => s.glacierMassBalance)
  const setGlacierMassBalance = useMapStore((s) => s.setGlacierMassBalance)

  const glaciers = useMemo(
    () => (glacierMassBalance.glaciers.length > 0 ? glacierMassBalance.glaciers : DEMO_GLACIERS),
    [glacierMassBalance.glaciers]
  )

  const filteredGlaciers = useMemo(() => {
    return glaciers.filter((g) => {
      if (glacierMassBalance.typeFilter !== 'all' && g.glacierType !== glacierMassBalance.typeFilter) return false
      return true
    })
  }, [glaciers, glacierMassBalance.typeFilter])

  const summary = useMemo(() => {
    if (filteredGlaciers.length === 0) {
      return { avgMassBalance: 0, retreatingCount: 0, totalWaterContribution: 0 }
    }
    const avgMassBalance =
      filteredGlaciers.reduce((sum, g) => sum + g.massBalance, 0) / filteredGlaciers.length
    const retreatingCount = filteredGlaciers.filter(
      (g) => g.healthStatus === 'retreating' || g.healthStatus === 'collapsing'
    ).length
    const totalWaterContribution = filteredGlaciers.reduce((sum, g) => sum + g.waterContribution, 0)
    return {
      avgMassBalance: Math.round(avgMassBalance * 100) / 100,
      retreatingCount,
      totalWaterContribution: Math.round(totalWaterContribution * 100) / 100,
    }
  }, [filteredGlaciers])

  const activeGlacier = useMemo(
    () => glaciers.find((g) => g.id === glacierMassBalance.activeGlacierId) ?? null,
    [glaciers, glacierMassBalance.activeGlacierId]
  )

  if (typeof window === 'undefined') return null
  if (!glacierMassBalance.open) return null

  const overlayToggles: { key: keyof GlacierMassBalanceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMassBalance', label: 'Mass Balance', icon: TrendingDown },
    { key: 'showAblation', label: 'Ablation', icon: Activity },
    { key: 'showHealthStatus', label: 'Health Status', icon: Filter },
    { key: 'showWaterContribution', label: 'Water Contribution', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainSnowIcon2 className="h-4 w-4 text-cyan-500" />
              Glacier Mass Balance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGlacierMassBalance({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Glacier Type
            </Label>
            <Select
              value={glacierMassBalance.typeFilter}
              onValueChange={(v) =>
                setGlacierMassBalance({
                  typeFilter: v as GlacierMassBalanceState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="valley">Valley</SelectItem>
                <SelectItem value="ice_cap">Ice Cap</SelectItem>
                <SelectItem value="piedmont">Piedmont</SelectItem>
                <SelectItem value="tidewater">Tidewater</SelectItem>
                <SelectItem value="hanging">Hanging</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={glacierMassBalance[key] as boolean}
                  onCheckedChange={(checked) => setGlacierMassBalance({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Mass Balance</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgMassBalance}</div>
              <div className="text-[9px] text-muted-foreground">m w.e./yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Retreating</div>
              <div className="text-sm font-semibold text-red-500">{summary.retreatingCount}</div>
              <div className="text-[9px] text-muted-foreground">glaciers</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Water Contribution</div>
              <div className="text-sm font-semibold text-cyan-500">{summary.totalWaterContribution}</div>
              <div className="text-[9px] text-muted-foreground">km³/yr</div>
            </div>
          </div>

          <Separator />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Glaciers ({filteredGlaciers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredGlaciers.map((glacier) => {
                  const isActive = glacierMassBalance.activeGlacierId === glacier.id
                  const healthCfg = HEALTH_CONFIG[glacier.healthStatus]
                  return (
                    <div
                      key={glacier.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setGlacierMassBalance({
                          activeGlacierId: isActive ? null : glacier.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{glacier.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {glacierMassBalance.showMassBalance && (
                          <div>
                            Mass Balance:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.massBalance} m w.e.
                            </span>
                          </div>
                        )}
                        {glacierMassBalance.showAblation && (
                          <div>
                            Ablation:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.ablation} m w.e.
                            </span>
                          </div>
                        )}
                        {glacierMassBalance.showHealthStatus && (
                          <div>
                            Health:{' '}
                            <span className="text-foreground font-medium">
                              {HEALTH_CONFIG[glacier.healthStatus].label}
                            </span>
                          </div>
                        )}
                        {glacierMassBalance.showWaterContribution && (
                          <div>
                            Water:{' '}
                            <span className="text-foreground font-medium">
                              {glacier.waterContribution} km³/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredGlaciers.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeGlacier && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeGlacier.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeGlacier.healthStatus].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeGlacier.healthStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeGlacier.latitude.toFixed(2)}, {activeGlacier.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mass Balance: </span>
                    <span className="font-medium">{activeGlacier.massBalance} m w.e./yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accumulation: </span>
                    <span className="font-medium">{activeGlacier.accumulation} m w.e.</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ablation: </span>
                    <span className="font-medium">{activeGlacier.ablation} m w.e.</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ELA: </span>
                    <span className="font-medium">{activeGlacier.equilibriumLineAltitude} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{activeGlacier.glacierType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Contribution: </span>
                    <span className="font-medium">{activeGlacier.waterContribution} km³/yr</span>
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
