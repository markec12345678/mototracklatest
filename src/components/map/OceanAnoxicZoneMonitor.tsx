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
import { useMapStore, type OceanAnoxicZoneState, type OceanAnoxicZoneData } from '@/lib/map-store'
import { Droplets as DropletsIcon5, X, Wind, FlaskConical, Layers, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: OceanAnoxicZoneData[] = [
  {
    id: 'oaz-etp',
    name: 'Eastern Tropical Pacific',
    lat: 12,
    lng: -105,
    oxygenLevel: 15,
    nitrate: 35,
    sulfide: 12,
    thickness: 400,
    depth: 350,
    status: 'severe',
    description: 'Major oxygen minimum zone off the coast of Central and South America',
  },
  {
    id: 'oaz-arabian',
    name: 'Arabian Sea',
    lat: 18,
    lng: 62,
    oxygenLevel: 8,
    nitrate: 40,
    sulfide: 25,
    thickness: 600,
    depth: 200,
    status: 'anoxic',
    description: 'One of the most intense oxygen minimum zones with persistent anoxia',
  },
  {
    id: 'oaz-bengal',
    name: 'Bay of Bengal',
    lat: 15,
    lng: 87,
    oxygenLevel: 12,
    nitrate: 38,
    sulfide: 18,
    thickness: 500,
    depth: 150,
    status: 'severe',
    description: 'Seasonal anoxic zone with increasing severity due to runoff and warming',
  },
  {
    id: 'oaz-eta',
    name: 'Eastern Tropical Atlantic',
    lat: 5,
    lng: -15,
    oxygenLevel: 25,
    nitrate: 28,
    sulfide: 8,
    thickness: 300,
    depth: 400,
    status: 'moderate',
    description: 'Moderate oxygen depletion zone along the West African continental shelf',
  },
  {
    id: 'oaz-cariaco',
    name: 'Cariaco Basin',
    lat: 10.5,
    lng: -64.7,
    oxygenLevel: 5,
    nitrate: 42,
    sulfide: 30,
    thickness: 800,
    depth: 100,
    status: 'anoxic',
    description: 'Permanently anoxic basin with long-term monitoring and high sulfide levels',
  },
  {
    id: 'oaz-blacksea',
    name: 'Black Sea',
    lat: 43,
    lng: 34,
    oxygenLevel: 3,
    nitrate: 45,
    sulfide: 35,
    thickness: 1500,
    depth: 80,
    status: 'anoxic',
    description: 'World\'s largest anoxic basin with a vast sulfidic layer below 80m depth',
  },
]

const STATUS_CONFIG: Record<
  OceanAnoxicZoneData['status'],
  { label: string; color: string; bgClass: string }
> = {
  healthy: { label: 'Healthy', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  mild_depletion: { label: 'Mild Depletion', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  anoxic: { label: 'Anoxic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SEVERITY_LABELS: Record<OceanAnoxicZoneState['severityFilter'], string> = {
  all: 'All Severities',
  healthy: 'Healthy',
  mild_depletion: 'Mild Depletion',
  moderate: 'Moderate',
  severe: 'Severe',
  anoxic: 'Anoxic',
}

export function OceanAnoxicZoneMonitor() {
  const state = useMapStore((s) => s.oceanAnoxicZone)
  const setState = useMapStore((s) => s.setOceanAnoxicZone)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.severityFilter !== 'all' && z.status !== state.severityFilter) return false
      return true
    })
  }, [zones, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgOxygen: 0, avgThickness: 0, anoxicCount: 0 }
    }
    const avgOxygen =
      filteredZones.reduce((sum, z) => sum + z.oxygenLevel, 0) / filteredZones.length
    const avgThickness =
      filteredZones.reduce((sum, z) => sum + z.thickness, 0) / filteredZones.length
    const anoxicCount = filteredZones.filter(
      (z) => z.status === 'anoxic' || z.status === 'severe'
    ).length
    return {
      avgOxygen: Math.round(avgOxygen * 10) / 10,
      avgThickness: Math.round(avgThickness),
      anoxicCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanAnoxicZoneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOxygenLevel', label: 'Oxygen Level', icon: Wind },
    { key: 'showNitrate', label: 'Nitrate', icon: FlaskConical },
    { key: 'showSulfide', label: 'Sulfide', icon: DropletsIcon5 },
    { key: 'showThickness', label: 'Thickness', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg shadow-indigo-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <DropletsIcon5 className="h-4 w-4 text-indigo-400" />
              Ocean Anoxic Zone Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-indigo-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-indigo-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as OceanAnoxicZoneState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                  <Icon className="h-3 w-3 text-indigo-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Oxygen</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgOxygen}</div>
              <div className="text-[9px] text-indigo-400">&mu;mol/L</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Avg Thickness</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgThickness}</div>
              <div className="text-[9px] text-indigo-400">m</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Severe/Anoxic</div>
              <div className="text-sm font-semibold text-orange-400">{summary.anoxicCount}</div>
              <div className="text-[9px] text-indigo-400">zones</div>
            </div>
          </div>

          <Separator className="bg-indigo-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300">
              Anoxic Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/60 bg-indigo-800/30'
                          : 'border-indigo-800/30 hover:border-indigo-600/40 hover:bg-indigo-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-indigo-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300">
                        {state.showOxygenLevel && (
                          <div>
                            O&#8322; Level:{' '}
                            <span className="text-indigo-100 font-medium">
                              {zone.oxygenLevel} &mu;mol/L
                            </span>
                          </div>
                        )}
                        {state.showNitrate && (
                          <div>
                            Nitrate:{' '}
                            <span className="text-indigo-100 font-medium">
                              {zone.nitrate} &mu;mol/L
                            </span>
                          </div>
                        )}
                        {state.showSulfide && (
                          <div>
                            Sulfide:{' '}
                            <span className="text-indigo-100 font-medium">
                              {zone.sulfide} &mu;mol/L
                            </span>
                          </div>
                        )}
                        {state.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-indigo-100 font-medium">
                              {zone.thickness} m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-indigo-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-indigo-800/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Oxygen Level: </span>
                    <span className="font-medium text-red-400">{activeZone.oxygenLevel} &mu;mol/L</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Nitrate: </span>
                    <span className="font-medium text-indigo-200">{activeZone.nitrate} &mu;mol/L</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Depth: </span>
                    <span className="font-medium text-indigo-200">{activeZone.depth} m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Sulfide: </span>
                    <span className="font-medium text-orange-400">{activeZone.sulfide} &mu;mol/L</span>
                  </div>
                  <div>
                    <span className="text-indigo-400">Thickness: </span>
                    <span className="font-medium text-indigo-200">{activeZone.thickness} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-indigo-400">Description: </span>
                    <span className="font-medium text-indigo-200">{activeZone.description}</span>
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
