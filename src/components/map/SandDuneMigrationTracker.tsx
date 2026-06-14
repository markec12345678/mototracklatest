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
import { useMapStore, type SandDuneMigrationState, type SandDune } from '@/lib/map-store'
import { Wind as WindIcon4, X, MoveRight, ArrowUp, Layers, ShieldCheck, MapPin, Filter } from 'lucide-react'

const DEMO_DUNES: SandDune[] = [
  {
    id: 'sd-sahara',
    name: 'Sahara Grand Erg',
    latitude: 27.50,
    longitude: 3.50,
    duneType: 'transverse',
    height: 180,
    migrationRate: 15,
    length: 560,
    windDirection: 'NE',
    sandVolume: 8500,
    stabilization: 'active',
  },
  {
    id: 'sd-gobi',
    name: 'Gobi Dust Field',
    latitude: 43.00,
    longitude: 105.00,
    duneType: 'barchan',
    height: 25,
    migrationRate: 12,
    length: 120,
    windDirection: 'NW',
    sandVolume: 2100,
    stabilization: 'semi_stabilized',
  },
  {
    id: 'sd-namib',
    name: 'Namib Star Dune',
    latitude: -24.75,
    longitude: 15.45,
    duneType: 'star',
    height: 325,
    migrationRate: 2,
    length: 800,
    windDirection: 'Variable',
    sandVolume: 12000,
    stabilization: 'active',
  },
  {
    id: 'sd-rubalkhali',
    name: 'Rub\u2019 al Khali',
    latitude: 22.00,
    longitude: 50.50,
    duneType: 'longitudinal',
    height: 250,
    migrationRate: 8,
    length: 1200,
    windDirection: 'SW',
    sandVolume: 15000,
    stabilization: 'active',
  },
  {
    id: 'sd-whiteands',
    name: 'White Sands Parabolic',
    latitude: 32.78,
    longitude: -106.17,
    duneType: 'parabolic',
    height: 18,
    migrationRate: 5,
    length: 90,
    windDirection: 'SW',
    sandVolume: 650,
    stabilization: 'stabilized',
  },
  {
    id: 'sd-taklamakan',
    name: 'Taklamakan Reactivating',
    latitude: 39.50,
    longitude: 82.00,
    duneType: 'dome',
    height: 80,
    migrationRate: 10,
    length: 300,
    windDirection: 'E',
    sandVolume: 5800,
    stabilization: 'reactivating',
  },
]

const STABILIZATION_CONFIG: Record<
  SandDune['stabilization'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  semi_stabilized: { label: 'Semi-Stabilized', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  stabilized: { label: 'Stabilized', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  reactivating: { label: 'Reactivating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const DUNE_TYPE_LABELS: Record<SandDune['duneType'], string> = {
  barchan: 'Barchan',
  transverse: 'Transverse',
  longitudinal: 'Longitudinal',
  star: 'Star',
  parabolic: 'Parabolic',
  dome: 'Dome',
}

export function SandDuneMigrationTracker() {
  const sandDuneMigration = useMapStore((s) => s.sandDuneMigration)
  const setSandDuneMigration = useMapStore((s) => s.setSandDuneMigration)

  const dunes = useMemo(
    () => (sandDuneMigration.dunes.length > 0 ? sandDuneMigration.dunes : DEMO_DUNES),
    [sandDuneMigration.dunes]
  )

  const filteredDunes = useMemo(() => {
    return dunes.filter((d) => {
      if (sandDuneMigration.typeFilter !== 'all' && d.duneType !== sandDuneMigration.typeFilter) return false
      return true
    })
  }, [dunes, sandDuneMigration.typeFilter])

  const summary = useMemo(() => {
    if (filteredDunes.length === 0) {
      return { avgMigrationRate: 0, tallestDune: 0, activeCount: 0 }
    }
    const avgMigrationRate = filteredDunes.reduce((sum, d) => sum + d.migrationRate, 0) / filteredDunes.length
    const tallestDune = Math.max(...filteredDunes.map((d) => d.height))
    const activeCount = filteredDunes.filter((d) => d.stabilization === 'active').length
    return {
      avgMigrationRate: Math.round(avgMigrationRate * 10) / 10,
      tallestDune,
      activeCount,
    }
  }, [filteredDunes])

  const activeDune = useMemo(
    () => dunes.find((d) => d.id === sandDuneMigration.activeDuneId) ?? null,
    [dunes, sandDuneMigration.activeDuneId]
  )

  if (typeof window === 'undefined') return null
  if (!sandDuneMigration.open) return null

  const overlayToggles: { key: keyof SandDuneMigrationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMigrationRate', label: 'Migration Rate', icon: MoveRight },
    { key: 'showHeight', label: 'Height', icon: ArrowUp },
    { key: 'showDuneType', label: 'Dune Type', icon: Layers },
    { key: 'showStabilization', label: 'Stabilization', icon: ShieldCheck },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon4 className="h-4 w-4 text-amber-500" />
              Sand Dune Migration Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSandDuneMigration({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Dune Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Dune Type
            </Label>
            <Select
              value={sandDuneMigration.typeFilter}
              onValueChange={(v) =>
                setSandDuneMigration({
                  typeFilter: v as SandDuneMigrationState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="barchan">Barchan</SelectItem>
                <SelectItem value="transverse">Transverse</SelectItem>
                <SelectItem value="longitudinal">Longitudinal</SelectItem>
                <SelectItem value="star">Star</SelectItem>
                <SelectItem value="parabolic">Parabolic</SelectItem>
                <SelectItem value="dome">Dome</SelectItem>
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
                  checked={sandDuneMigration[key] as boolean}
                  onCheckedChange={(checked) => setSandDuneMigration({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Migration</div>
              <div className="text-sm font-semibold text-amber-500">{summary.avgMigrationRate}</div>
              <div className="text-[9px] text-muted-foreground">m/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Tallest Dune</div>
              <div className="text-sm font-semibold">{summary.tallestDune}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Active Dunes</div>
              <div className="text-sm font-semibold text-orange-500">{summary.activeCount}</div>
              <div className="text-[9px] text-muted-foreground">dunes</div>
            </div>
          </div>

          <Separator />

          {/* Dune List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Sand Dunes ({filteredDunes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredDunes.map((dune) => {
                  const isActive = sandDuneMigration.activeDuneId === dune.id
                  const stabCfg = STABILIZATION_CONFIG[dune.stabilization]
                  return (
                    <div
                      key={dune.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setSandDuneMigration({
                          activeDuneId: isActive ? null : dune.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stabCfg.color }}
                          />
                          <span className="text-xs font-medium">{dune.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${stabCfg.bgClass}`}
                        >
                          {stabCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {sandDuneMigration.showMigrationRate && (
                          <div>
                            Migration:{' '}
                            <span className="text-foreground font-medium">
                              {dune.migrationRate} m/yr
                            </span>
                          </div>
                        )}
                        {sandDuneMigration.showHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-foreground font-medium">
                              {dune.height} m
                            </span>
                          </div>
                        )}
                        {sandDuneMigration.showDuneType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {DUNE_TYPE_LABELS[dune.duneType]}
                            </span>
                          </div>
                        )}
                        {sandDuneMigration.showStabilization && (
                          <div>
                            Status:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${stabCfg.bgClass}`}
                            >
                              {stabCfg.label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredDunes.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No dunes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Dune Details */}
          {activeDune && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeDune.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STABILIZATION_CONFIG[activeDune.stabilization].bgClass}`}
                  >
                    {STABILIZATION_CONFIG[activeDune.stabilization].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeDune.latitude.toFixed(2)}, {activeDune.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Migration Rate: </span>
                    <span className="font-medium">{activeDune.migrationRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Height: </span>
                    <span className="font-medium">{activeDune.height} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeDune.length} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Direction: </span>
                    <span className="font-medium">{activeDune.windDirection}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sand Volume: </span>
                    <span className="font-medium">{activeDune.sandVolume.toLocaleString()} km³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dune Type: </span>
                    <span className="font-medium">{DUNE_TYPE_LABELS[activeDune.duneType]}</span>
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
