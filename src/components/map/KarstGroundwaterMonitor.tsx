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
import { useMapStore, type KarstGroundwaterState, type KarstSystem } from '@/lib/map-store'
import { Droplet as DropletIcon3, X, Gauge, Waves, ShieldAlert, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_SYSTEMS: KarstSystem[] = [
  {
    id: 'ks-slovenia',
    name: 'Slovenian Karst',
    latitude: 45.83,
    longitude: 14.23,
    conduitType: 'conduit',
    waterLevel: 12.5,
    rechargeRate: 45.2,
    dischargeRate: 38.7,
    conductivity: 320,
    vulnerability: 'high',
    contaminationRisk: 'moderate',
  },
  {
    id: 'ks-florida',
    name: 'Florida Aquifer',
    latitude: 29.65,
    longitude: -82.35,
    conduitType: 'sinkhole',
    waterLevel: 8.3,
    rechargeRate: 62.1,
    dischargeRate: 55.4,
    conductivity: 410,
    vulnerability: 'very_high',
    contaminationRisk: 'high',
  },
  {
    id: 'ks-yucatan',
    name: 'Yucatan Cenotes',
    latitude: 20.71,
    longitude: -89.62,
    conduitType: 'conduit',
    waterLevel: 5.2,
    rechargeRate: 78.5,
    dischargeRate: 71.2,
    conductivity: 580,
    vulnerability: 'extreme',
    contaminationRisk: 'critical',
  },
  {
    id: 'ks-schina',
    name: 'South China Karst',
    latitude: 25.27,
    longitude: 110.29,
    conduitType: 'mixed',
    waterLevel: 15.8,
    rechargeRate: 55.3,
    dischargeRate: 48.9,
    conductivity: 290,
    vulnerability: 'moderate',
    contaminationRisk: 'low',
  },
  {
    id: 'ks-dalmatia',
    name: 'Dalmatian Coast',
    latitude: 43.51,
    longitude: 16.47,
    conduitType: 'spring',
    waterLevel: 3.7,
    rechargeRate: 35.8,
    dischargeRate: 32.1,
    conductivity: 450,
    vulnerability: 'high',
    contaminationRisk: 'moderate',
  },
  {
    id: 'ks-mammoth',
    name: 'Mammoth Cave USA',
    latitude: 37.19,
    longitude: -86.10,
    conduitType: 'diffuse',
    waterLevel: 22.4,
    rechargeRate: 28.6,
    dischargeRate: 24.3,
    conductivity: 210,
    vulnerability: 'low',
    contaminationRisk: 'none',
  },
]

const VULNERABILITY_CONFIG: Record<
  KarstSystem['vulnerability'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  extreme: { label: 'Extreme', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

const CONTAMINATION_CONFIG: Record<
  KarstSystem['contaminationRisk'],
  { label: string; bgClass: string }
> = {
  none: { label: 'None', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CONDUIT_CONFIG: Record<
  KarstSystem['conduitType'],
  { label: string }
> = {
  conduit: { label: 'Conduit' },
  diffuse: { label: 'Diffuse' },
  mixed: { label: 'Mixed' },
  sinkhole: { label: 'Sinkhole' },
  spring: { label: 'Spring' },
}

export function KarstGroundwaterMonitor() {
  const state = useMapStore((s) => s.karstGroundwater)
  const setState = useMapStore((s) => s.setKarstGroundwater)

  const systems = useMemo(
    () => (state.systems.length > 0 ? state.systems : DEMO_SYSTEMS),
    [state.systems]
  )

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      if (state.vulnerabilityFilter !== 'all' && s.vulnerability !== state.vulnerabilityFilter) return false
      return true
    })
  }, [systems, state.vulnerabilityFilter])

  const summary = useMemo(() => {
    if (filteredSystems.length === 0) {
      return { avgWaterLevel: 0, avgRechargeRate: 0, highVulnCount: 0 }
    }
    const avgWaterLevel = filteredSystems.reduce((sum, s) => sum + s.waterLevel, 0) / filteredSystems.length
    const avgRechargeRate = filteredSystems.reduce((sum, s) => sum + s.rechargeRate, 0) / filteredSystems.length
    const highVulnCount = filteredSystems.filter(
      (s) => s.vulnerability === 'very_high' || s.vulnerability === 'extreme'
    ).length
    return {
      avgWaterLevel: Math.round(avgWaterLevel * 10) / 10,
      avgRechargeRate: Math.round(avgRechargeRate * 10) / 10,
      highVulnCount,
    }
  }, [filteredSystems])

  const activeSystem = useMemo(
    () => systems.find((s) => s.id === state.activeSystemId) ?? null,
    [systems, state.activeSystemId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KarstGroundwaterState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterLevel', label: 'Water Level', icon: Gauge },
    { key: 'showRechargeRate', label: 'Recharge Rate', icon: Waves },
    { key: 'showVulnerability', label: 'Vulnerability', icon: ShieldAlert },
    { key: 'showContaminationRisk', label: 'Contamination Risk', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletIcon3 className="h-4 w-4 text-teal-600" />
              Karst Groundwater Monitor
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
          {/* Vulnerability Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Vulnerability Level
            </Label>
            <Select
              value={state.vulnerabilityFilter}
              onValueChange={(v) =>
                setState({
                  vulnerabilityFilter: v as KarstGroundwaterState['vulnerabilityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vulnerabilities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Water Level</div>
              <div className="text-sm font-semibold">{summary.avgWaterLevel}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Recharge</div>
              <div className="text-sm font-semibold text-teal-600">{summary.avgRechargeRate}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">V.High/Extreme</div>
              <div className="text-sm font-semibold text-purple-600">{summary.highVulnCount}</div>
              <div className="text-[9px] text-muted-foreground">systems</div>
            </div>
          </div>

          <Separator />

          {/* System List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Karst Systems ({filteredSystems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSystems.map((system) => {
                  const isActive = state.activeSystemId === system.id
                  const vulnCfg = VULNERABILITY_CONFIG[system.vulnerability]
                  return (
                    <div
                      key={system.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSystemId: isActive ? null : system.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: vulnCfg.color }}
                          />
                          <span className="text-xs font-medium">{system.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${vulnCfg.bgClass}`}
                        >
                          {vulnCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showWaterLevel && (
                          <div>
                            Water Level:{' '}
                            <span className="text-foreground font-medium">
                              {system.waterLevel}m
                            </span>
                          </div>
                        )}
                        {state.showRechargeRate && (
                          <div>
                            Recharge:{' '}
                            <span className="text-foreground font-medium">
                              {system.rechargeRate}mm/yr
                            </span>
                          </div>
                        )}
                        {state.showVulnerability && (
                          <div>
                            Conduit:{' '}
                            <span className="text-foreground font-medium">
                              {CONDUIT_CONFIG[system.conduitType].label}
                            </span>
                          </div>
                        )}
                        {state.showContaminationRisk && (
                          <div>
                            Contamination:{' '}
                            <span className="text-foreground font-medium">
                              {CONTAMINATION_CONFIG[system.contaminationRisk].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSystems.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No systems match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active System Details */}
          {activeSystem && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold">{activeSystem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${VULNERABILITY_CONFIG[activeSystem.vulnerability].bgClass}`}
                  >
                    {VULNERABILITY_CONFIG[activeSystem.vulnerability].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSystem.latitude.toFixed(2)}, {activeSystem.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conduit Type: </span>
                    <span className="font-medium">{CONDUIT_CONFIG[activeSystem.conduitType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Level: </span>
                    <span className="font-medium">{activeSystem.waterLevel}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recharge Rate: </span>
                    <span className="font-medium">{activeSystem.rechargeRate}mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discharge Rate: </span>
                    <span className="font-medium">{activeSystem.dischargeRate}mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conductivity: </span>
                    <span className="font-medium">{activeSystem.conductivity}µS/cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vulnerability: </span>
                    <span className="font-medium">{VULNERABILITY_CONFIG[activeSystem.vulnerability].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contamination: </span>
                    <span className="font-medium">{CONTAMINATION_CONFIG[activeSystem.contaminationRisk].label}</span>
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
