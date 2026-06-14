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
import { useMapStore, type CoralDiseaseMonitorState, type CoralDiseaseMonitorData } from '@/lib/map-store'
import { Bug as BugIcon3, X, Activity, Shield, Heart, Thermometer, MapPin, Filter } from 'lucide-react'

const DEMO_REEFS: CoralDiseaseMonitorData[] = [
  {
    id: 'cdm-gbr',
    name: 'Great Barrier Reef',
    lat: -18,
    lng: 147,
    prevalence: 35,
    whiteSyndrome: 25,
    blackBand: 10,
    recoveryRate: 20,
    waterTemp: 29.5,
    status: 'high',
    description: 'High disease prevalence linked to thermal stress events',
  },
  {
    id: 'cdm-caribbean',
    name: 'Caribbean',
    lat: 18,
    lng: -65,
    prevalence: 45,
    whiteSyndrome: 30,
    blackBand: 15,
    recoveryRate: 10,
    waterTemp: 30.2,
    status: 'epidemic',
    description: 'Epidemic-level disease outbreak across Caribbean reefs',
  },
  {
    id: 'cdm-redsea',
    name: 'Red Sea',
    lat: 22,
    lng: 38,
    prevalence: 8,
    whiteSyndrome: 3,
    blackBand: 2,
    recoveryRate: 60,
    waterTemp: 26.0,
    status: 'healthy',
    description: 'Healthy reef system with minimal disease presence',
  },
  {
    id: 'cdm-hawaii',
    name: 'Hawaii',
    lat: 20,
    lng: -156,
    prevalence: 20,
    whiteSyndrome: 12,
    blackBand: 8,
    recoveryRate: 35,
    waterTemp: 28.0,
    status: 'moderate',
    description: 'Moderate disease levels with ongoing monitoring programs',
  },
  {
    id: 'cdm-indian',
    name: 'Indian Ocean',
    lat: -5,
    lng: 73,
    prevalence: 28,
    whiteSyndrome: 18,
    blackBand: 10,
    recoveryRate: 25,
    waterTemp: 29.0,
    status: 'high',
    description: 'Elevated disease rates associated with warming waters',
  },
  {
    id: 'cdm-triangle',
    name: 'Coral Triangle',
    lat: 0,
    lng: 125,
    prevalence: 15,
    whiteSyndrome: 8,
    blackBand: 5,
    recoveryRate: 45,
    waterTemp: 28.5,
    status: 'low',
    description: 'Low disease prevalence in biodiverse coral hotspot',
  },
]

const STATUS_CONFIG: Record<
  CoralDiseaseMonitorData['status'],
  { label: string; color: string; bgClass: string }
> = {
  healthy: { label: 'Healthy', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  epidemic: { label: 'Epidemic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function CoralDiseaseMonitor() {
  const state = useMapStore((s) => s.coralDiseaseMonitor)
  const setState = useMapStore((s) => s.setCoralDiseaseMonitor)

  const reefs = useMemo(
    () => (state.reefs.length > 0 ? state.reefs : DEMO_REEFS),
    [state.reefs]
  )

  const filteredReefs = useMemo(() => {
    return reefs.filter((r) => {
      if (state.diseaseFilter !== 'all') {
        const diseaseMap: Record<string, string[]> = {
          white_syndrome: ['cdm-gbr', 'cdm-caribbean', 'cdm-hawaii', 'cdm-indian'],
          black_band: ['cdm-caribbean', 'cdm-gbr', 'cdm-indian'],
          yellow_band: ['cdm-caribbean', 'cdm-hawaii'],
          tumor: ['cdm-gbr', 'cdm-indian'],
        }
        if (!diseaseMap[state.diseaseFilter]?.includes(r.id)) return false
      }
      return true
    })
  }, [reefs, state.diseaseFilter])

  const summary = useMemo(() => {
    if (filteredReefs.length === 0) {
      return { avgPrevalence: 0, avgRecovery: 0, epidemicCount: 0 }
    }
    const avgPrevalence =
      filteredReefs.reduce((sum, r) => sum + r.prevalence, 0) / filteredReefs.length
    const avgRecovery =
      filteredReefs.reduce((sum, r) => sum + r.recoveryRate, 0) / filteredReefs.length
    const epidemicCount = filteredReefs.filter(
      (r) => r.status === 'epidemic' || r.status === 'high'
    ).length
    return {
      avgPrevalence: Math.round(avgPrevalence * 10) / 10,
      avgRecovery: Math.round(avgRecovery * 10) / 10,
      epidemicCount,
    }
  }, [filteredReefs])

  const activeReef = useMemo(
    () => reefs.find((r) => r.id === state.activeReefId) ?? null,
    [reefs, state.activeReefId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralDiseaseMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPrevalence', label: 'Prevalence', icon: Activity },
    { key: 'showWhiteSyndrome', label: 'White Syndrome', icon: Shield },
    { key: 'showBlackBand', label: 'Black Band', icon: BugIcon3 },
    { key: 'showRecoveryRate', label: 'Recovery Rate', icon: Heart },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-pink-950/95 to-purple-950/95 backdrop-blur-xl border border-pink-800/40 rounded-xl shadow-lg shadow-pink-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-pink-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-pink-100">
              <BugIcon3 className="h-4 w-4 text-pink-400" />
              Coral Disease Monitor
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
          {/* Disease Filter */}
          <div>
            <Label className="text-xs text-pink-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Disease Type
            </Label>
            <Select
              value={state.diseaseFilter}
              onValueChange={(v) =>
                setState({
                  diseaseFilter: v as CoralDiseaseMonitorState['diseaseFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-pink-900/40 border-pink-700/40 text-pink-100 hover:bg-pink-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                <SelectItem value="white_syndrome">White Syndrome</SelectItem>
                <SelectItem value="black_band">Black Band</SelectItem>
                <SelectItem value="yellow_band">Yellow Band</SelectItem>
                <SelectItem value="tumor">Tumor</SelectItem>
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
              <div className="text-[10px] text-pink-400">Avg Prevalence</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgPrevalence}%</div>
              <div className="text-[9px] text-pink-400">disease</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400">Avg Recovery</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgRecovery}%</div>
              <div className="text-[9px] text-pink-400">rate</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400">Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.epidemicCount}</div>
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
                        {state.showPrevalence && (
                          <div>
                            Prevalence:{' '}
                            <span className="text-orange-400 font-medium">
                              {reef.prevalence}%
                            </span>
                          </div>
                        )}
                        {state.showWhiteSyndrome && (
                          <div>
                            White Syn:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.whiteSyndrome}%
                            </span>
                          </div>
                        )}
                        {state.showBlackBand && (
                          <div>
                            Black Band:{' '}
                            <span className="text-pink-100 font-medium">
                              {reef.blackBand}%
                            </span>
                          </div>
                        )}
                        {state.showRecoveryRate && (
                          <div>
                            Recovery:{' '}
                            <span className="text-emerald-400 font-medium">
                              {reef.recoveryRate}%
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
                    <span className="text-pink-400">Prevalence: </span>
                    <span className="font-medium text-orange-400">{activeReef.prevalence}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">White Syndrome: </span>
                    <span className="font-medium text-pink-200">{activeReef.whiteSyndrome}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Black Band: </span>
                    <span className="font-medium text-pink-200">{activeReef.blackBand}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Recovery Rate: </span>
                    <span className="font-medium text-emerald-400">{activeReef.recoveryRate}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400">Water Temp: </span>
                    <span className="font-medium text-red-400">{activeReef.waterTemp}&deg;C</span>
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
