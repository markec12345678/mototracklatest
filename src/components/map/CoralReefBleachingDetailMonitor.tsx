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
import { useMapStore, type CoralReefBleachingDetailState, type CoralReefBleachingDetailData } from '@/lib/map-store'
import { Shell as ShellIcon2, X, Thermometer, Droplets, Heart, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_REEFS: CoralReefBleachingDetailData[] = [
  {
    id: 'cr-gbr-north',
    name: 'Great Barrier Reef North',
    lat: -15,
    lng: 145,
    bleachingPercent: 72,
    sst: 29.8,
    recovery: 25,
    stressLevel: 85,
    diversity: 60,
    status: 'severe',
    description: 'Northern section of the GBR experiencing severe bleaching',
  },
  {
    id: 'cr-gbr-south',
    name: 'Great Barrier Reef South',
    lat: -22,
    lng: 150,
    bleachingPercent: 35,
    sst: 27.5,
    recovery: 55,
    stressLevel: 50,
    diversity: 75,
    status: 'moderate',
    description: 'Southern GBR with moderate bleaching and better recovery',
  },
  {
    id: 'cr-caribbean',
    name: 'Caribbean Mesoamerican',
    lat: 17,
    lng: -87,
    bleachingPercent: 48,
    sst: 29.2,
    recovery: 40,
    stressLevel: 65,
    diversity: 68,
    status: 'moderate',
    description: 'Mesoamerican Barrier Reef under moderate thermal stress',
  },
  {
    id: 'cr-maldives',
    name: 'Maldives Atolls',
    lat: 4,
    lng: 73,
    bleachingPercent: 82,
    sst: 30.5,
    recovery: 15,
    stressLevel: 92,
    diversity: 45,
    status: 'extreme',
    description: 'Maldivian coral reefs under extreme bleaching pressure',
  },
  {
    id: 'cr-redsea',
    name: 'Red Sea',
    lat: 22,
    lng: 38,
    bleachingPercent: 15,
    sst: 26.8,
    recovery: 80,
    stressLevel: 25,
    diversity: 85,
    status: 'mild',
    description: 'Red Sea reefs showing mild bleaching with high resilience',
  },
  {
    id: 'cr-triangle',
    name: 'Coral Triangle',
    lat: -2,
    lng: 128,
    bleachingPercent: 55,
    sst: 29.0,
    recovery: 35,
    stressLevel: 70,
    diversity: 72,
    status: 'severe',
    description: 'Coral Triangle biodiversity hotspot under severe stress',
  },
]

const STATUS_CONFIG: Record<
  CoralReefBleachingDetailData['status'],
  { label: string; color: string; bgClass: string }
> = {
  healthy: { label: 'Healthy', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  mild: { label: 'Mild', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function CoralReefBleachingDetailMonitor() {
  const state = useMapStore((s) => s.coralReefBleachingDetail)
  const setState = useMapStore((s) => s.setCoralReefBleachingDetail)

  const reefs = useMemo(
    () => (state.reefs.length > 0 ? state.reefs : DEMO_REEFS),
    [state.reefs]
  )

  const filteredReefs = useMemo(() => {
    return reefs.filter((r) => {
      if (state.severityFilter !== 'all' && r.status !== state.severityFilter) return false
      return true
    })
  }, [reefs, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredReefs.length === 0) {
      return { avgBleaching: 0, avgSST: 0, severeExtremeCount: 0 }
    }
    const avgBleaching =
      filteredReefs.reduce((sum, r) => sum + r.bleachingPercent, 0) / filteredReefs.length
    const avgSST =
      filteredReefs.reduce((sum, r) => sum + r.sst, 0) / filteredReefs.length
    const severeExtremeCount = filteredReefs.filter(
      (r) => r.status === 'severe' || r.status === 'extreme'
    ).length
    return {
      avgBleaching: Math.round(avgBleaching * 10) / 10,
      avgSST: Math.round(avgSST * 10) / 10,
      severeExtremeCount,
    }
  }, [filteredReefs])

  const activeReef = useMemo(
    () => reefs.find((r) => r.id === state.activeReefId) ?? null,
    [reefs, state.activeReefId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralReefBleachingDetailState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBleachingPercent', label: 'Bleaching %', icon: Droplets },
    { key: 'showSST', label: 'SST', icon: Thermometer },
    { key: 'showRecovery', label: 'Recovery', icon: Heart },
    { key: 'showStressLevel', label: 'Stress Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-pink-950/95 to-rose-950/95 backdrop-blur-xl border border-pink-800/40 rounded-xl shadow-lg shadow-pink-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-pink-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-pink-100">
              <ShellIcon2 className="h-4 w-4 text-pink-400" />
              Coral Reef Bleaching Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-pink-300 hover:text-pink-100 hover:bg-pink-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-pink-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-pink-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Bleaching Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as CoralReefBleachingDetailState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-pink-900/40 border-pink-700/40 text-pink-100 hover:bg-pink-900/60">
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

          <Separator className="bg-pink-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-pink-200">
                  <Icon className="h-3 w-3 text-pink-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-pink-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-pink-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400">Avg Bleaching</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgBleaching}</div>
              <div className="text-[9px] text-pink-400">%</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400">Avg SST</div>
              <div className="text-sm font-semibold text-pink-300">{summary.avgSST}</div>
              <div className="text-[9px] text-pink-400">&deg;C</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400">Critical</div>
              <div className="text-sm font-semibold text-pink-200">{summary.severeExtremeCount}</div>
              <div className="text-[9px] text-pink-400">reefs</div>
            </div>
          </div>

          <Separator className="bg-pink-800/30" />

          {/* Reef List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300">
              Coral Reefs ({filteredReefs.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredReefs.map((reef) => {
                  const isActive = state.activeReefId === reef.id
                  const statusCfg = STATUS_CONFIG[reef.status]
                  return (
                    <div
                      key={reef.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/60 bg-pink-800/30'
                          : 'border-pink-800/30 hover:border-pink-600/40 hover:bg-pink-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeReefId: isActive ? null : reef.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-pink-100">{reef.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-pink-300">
                        {state.showBleachingPercent && (
                          <div>
                            Bleaching:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.bleachingPercent}%
                            </span>
                          </div>
                        )}
                        {state.showSST && (
                          <div>
                            SST:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.sst}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showRecovery && (
                          <div>
                            Recovery:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.recovery}%
                            </span>
                          </div>
                        )}
                        {state.showStressLevel && (
                          <div>
                            Stress:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.stressLevel}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredReefs.length === 0 && (
                  <div className="text-center text-xs text-pink-400 py-4">
                    No reefs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reef Details */}
          {activeReef && (
            <>
              <Separator className="bg-pink-800/30" />
              <div className="space-y-2 rounded-lg border border-pink-600/30 bg-pink-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-100">{activeReef.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeReef.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeReef.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-pink-400">Coordinates: </span>
                    <span className="font-medium text-pink-100">
                      {activeReef.lat.toFixed(1)}, {activeReef.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pink-400">Bleaching: </span>
                    <span className="font-medium text-red-400">{activeReef.bleachingPercent}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">SST: </span>
                    <span className="font-medium text-pink-200">{activeReef.sst}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Recovery: </span>
                    <span className="font-medium text-pink-200">{activeReef.recovery}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Stress Level: </span>
                    <span className="font-medium text-pink-200">{activeReef.stressLevel}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Diversity: </span>
                    <span className="font-medium text-pink-200">{activeReef.diversity}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-pink-400">Description: </span>
                    <span className="font-medium text-pink-200">{activeReef.description}</span>
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
