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
import { useMapStore, type MigratoryFlywayState, type MigratoryFlywayData } from '@/lib/map-store'
import { Bird as BirdIcon3, X, MapPin, Filter, Users, TrendingDown, Activity } from 'lucide-react'

const DEMO_FLYWAYS: MigratoryFlywayData[] = [
  {
    id: 'mf-east-atlantic',
    name: 'East Atlantic Flyway',
    lat: 52.0,
    lng: 5.0,
    population: 2500000,
    arrivalDate: 'Apr 1',
    threatLevel: 35,
    habitatQuality: 72,
    migrationDistance: 10000,
    status: 'active',
    description: 'Major flyway connecting Arctic breeding grounds to West African wintering areas along the Atlantic coast of Europe and Africa.',
  },
  {
    id: 'mf-mississippi',
    name: 'Mississippi Flyway',
    lat: 40.0,
    lng: -90.0,
    population: 3800000,
    arrivalDate: 'Mar 15',
    threatLevel: 42,
    habitatQuality: 65,
    migrationDistance: 5000,
    status: 'peak',
    description: 'Follows the Mississippi River corridor from Canada to the Gulf of Mexico, one of the most heavily used flyways in North America.',
  },
  {
    id: 'mf-east-asian',
    name: 'East Asian-Australasian',
    lat: 30.0,
    lng: 120.0,
    population: 5000000,
    arrivalDate: 'Mar 1',
    threatLevel: 68,
    habitatQuality: 45,
    migrationDistance: 12000,
    status: 'declining',
    description: 'Spans from Alaska to New Zealand, crossing 22 countries with critical stopover sites in the Yellow Sea region.',
  },
  {
    id: 'mf-central-asian',
    name: 'Central Asian Flyway',
    lat: 35.0,
    lng: 70.0,
    population: 1200000,
    arrivalDate: 'Mar 20',
    threatLevel: 55,
    habitatQuality: 52,
    migrationDistance: 8000,
    status: 'arriving',
    description: 'Connects Central Asian breeding grounds to South Asian wintering areas, with key staging areas in the Caspian region.',
  },
  {
    id: 'mf-americas-pacific',
    name: 'Americas Pacific Flyway',
    lat: 45.0,
    lng: -120.0,
    population: 1800000,
    arrivalDate: 'Apr 10',
    threatLevel: 38,
    habitatQuality: 68,
    migrationDistance: 14000,
    status: 'departing',
    description: 'Extends from Arctic Alaska along the Pacific coast to Patagonia, the longest flyway in the Americas.',
  },
  {
    id: 'mf-african-eurasian',
    name: 'African-Eurasian',
    lat: 25.0,
    lng: 20.0,
    population: 3200000,
    arrivalDate: 'Mar 25',
    threatLevel: 48,
    habitatQuality: 58,
    migrationDistance: 9000,
    status: 'active',
    description: 'Links European and Asian breeding grounds to African wintering areas across the Sahara and Mediterranean.',
  },
]

const STATUS_CONFIG: Record<
  MigratoryFlywayData['status'],
  { label: string; color: string; bgClass: string; dotClass: string }
> = {
  peak: {
    label: 'Peak',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  active: {
    label: 'Active',
    color: '#22c55e',
    bgClass: 'bg-green-500/10 text-green-600 border-green-500/30',
    dotClass: 'bg-green-500',
  },
  arriving: {
    label: 'Arriving',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  departing: {
    label: 'Departing',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    dotClass: 'bg-yellow-500',
  },
  declining: {
    label: 'Declining',
    color: '#ef4444',
    bgClass: 'bg-red-500/10 text-red-600 border-red-500/30',
    dotClass: 'bg-red-500',
  },
}

const TYPE_FILTER_OPTIONS: { value: MigratoryFlywayState['typeFilter']; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'land_bird', label: 'Land Birds' },
  { value: 'waterfowl', label: 'Waterfowl' },
  { value: 'shorebird', label: 'Shorebirds' },
  { value: 'raptor', label: 'Raptors' },
]

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function getThreatColor(level: number): string {
  if (level >= 60) return 'text-red-500'
  if (level >= 40) return 'text-orange-500'
  if (level >= 25) return 'text-yellow-500'
  return 'text-green-500'
}

function getQualityColor(quality: number): string {
  if (quality >= 70) return 'text-emerald-500'
  if (quality >= 55) return 'text-green-500'
  if (quality >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

export function MigratoryFlywayMonitor() {
  const state = useMapStore((s) => s.migratoryFlyway)
  const setState = useMapStore((s) => s.setMigratoryFlyway)

  const flyways = useMemo(
    () => (state.flyways.length > 0 ? state.flyways : DEMO_FLYWAYS),
    [state.flyways]
  )

  const filteredFlyways = useMemo(() => {
    return flyways.filter(() => {
      if (state.typeFilter !== 'all') return true
      return true
    })
  }, [flyways, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredFlyways.length === 0) {
      return { avgPopulation: 0, avgHabitatQuality: 0, decliningCount: 0 }
    }
    const avgPopulation = filteredFlyways.reduce((sum, f) => sum + f.population, 0) / filteredFlyways.length
    const avgHabitatQuality = filteredFlyways.reduce((sum, f) => sum + f.habitatQuality, 0) / filteredFlyways.length
    const decliningCount = filteredFlyways.filter((f) => f.status === 'declining').length
    return {
      avgPopulation: Math.round(avgPopulation),
      avgHabitatQuality: Math.round(avgHabitatQuality * 10) / 10,
      decliningCount,
    }
  }, [filteredFlyways])

  const activeFlyway = useMemo(
    () => flyways.find((f) => f.id === state.activeFlywayId) ?? null,
    [flyways, state.activeFlywayId]
  )

  const overlayToggles: { key: keyof Pick<MigratoryFlywayState, 'showPopulation' | 'showArrivalDate' | 'showThreatLevel' | 'showHabitatQuality'>; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPopulation', label: 'Population', icon: Users },
    { key: 'showArrivalDate', label: 'Arrival Date', icon: BirdIcon3 },
    { key: 'showThreatLevel', label: 'Threat Level', icon: Activity },
    { key: 'showHabitatQuality', label: 'Habitat Quality', icon: MapPin },
  ]

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-500/20 rounded-xl shadow-lg overflow-hidden text-sky-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <BirdIcon3 className="h-4 w-4 text-sky-400" />
              Migratory Flyway Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Bird Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as MigratoryFlywayState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/50 border-sky-700/50 text-sky-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
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

          <Separator className="bg-sky-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-800/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Population</div>
              <div className="text-sm font-semibold text-sky-100">{formatPopulation(summary.avgPopulation)}</div>
              <div className="text-[9px] text-sky-400">individuals</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-800/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Habitat Quality</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgHabitatQuality}%</div>
              <div className="text-[9px] text-sky-400">index</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-800/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Declining</div>
              <div className="text-sm font-semibold text-red-400">{summary.decliningCount}</div>
              <div className="text-[9px] text-sky-400">flyways</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Flyway List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Flyways ({filteredFlyways.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlyways.map((flyway) => {
                  const isActive = state.activeFlywayId === flyway.id
                  const statusCfg = STATUS_CONFIG[flyway.status]
                  return (
                    <div
                      key={flyway.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-800/40'
                          : 'border-sky-700/30 hover:border-sky-500/20 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeFlywayId: isActive ? null : flyway.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-sky-100">{flyway.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {state.showPopulation && (
                          <div>
                            Population:{' '}
                            <span className="text-sky-100 font-medium">
                              {formatPopulation(flyway.population)}
                            </span>
                          </div>
                        )}
                        {state.showArrivalDate && (
                          <div>
                            Arrival:{' '}
                            <span className="text-sky-100 font-medium">
                              {flyway.arrivalDate}
                            </span>
                          </div>
                        )}
                        {state.showThreatLevel && (
                          <div>
                            Threat:{' '}
                            <span className={`font-medium ${getThreatColor(flyway.threatLevel)}`}>
                              {flyway.threatLevel}%
                            </span>
                          </div>
                        )}
                        {state.showHabitatQuality && (
                          <div>
                            Habitat:{' '}
                            <span className={`font-medium ${getQualityColor(flyway.habitatQuality)}`}>
                              {flyway.habitatQuality}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlyways.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No flyways match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flyway Details */}
          {activeFlyway && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-500/30 bg-sky-800/40 p-3">
                <div className="flex items-center gap-2">
                  <BirdIcon3 className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeFlyway.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeFlyway.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeFlyway.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-sky-200">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeFlyway.lat.toFixed(1)}, {activeFlyway.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Population: </span>
                    <span className="font-medium text-sky-100">{formatPopulation(activeFlyway.population)}</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Arrival: </span>
                    <span className="font-medium text-sky-100">{activeFlyway.arrivalDate}</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Migration: </span>
                    <span className="font-medium text-sky-100">{activeFlyway.migrationDistance.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Threat Level: </span>
                    <span className={`font-medium ${getThreatColor(activeFlyway.threatLevel)}`}>
                      {activeFlyway.threatLevel}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Habitat Quality: </span>
                    <span className={`font-medium ${getQualityColor(activeFlyway.habitatQuality)}`}>
                      {activeFlyway.habitatQuality}%
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-sky-300 pt-1 border-t border-sky-700/30">
                  {activeFlyway.description}
                </div>

                {/* Threat & Quality Bars */}
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-sky-400">Threat Level</span>
                      <span className={getThreatColor(activeFlyway.threatLevel)}>{activeFlyway.threatLevel}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${activeFlyway.threatLevel}%`,
                          backgroundColor: activeFlyway.threatLevel >= 60 ? '#ef4444' : activeFlyway.threatLevel >= 40 ? '#f97316' : activeFlyway.threatLevel >= 25 ? '#eab308' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-sky-400">Habitat Quality</span>
                      <span className={getQualityColor(activeFlyway.habitatQuality)}>{activeFlyway.habitatQuality}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${activeFlyway.habitatQuality}%`,
                          backgroundColor: activeFlyway.habitatQuality >= 70 ? '#10b981' : activeFlyway.habitatQuality >= 55 ? '#22c55e' : activeFlyway.habitatQuality >= 40 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
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
