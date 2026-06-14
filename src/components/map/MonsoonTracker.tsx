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
import { useMapStore, type MonsoonData, type MonsoonState } from '@/lib/map-store'
import { CloudRain as CloudRainIcon2, X, Droplets, Wind, MapPin, Filter, Cloud } from 'lucide-react'

const DEMO_SYSTEMS: MonsoonData[] = [
  {
    id: 'mn-indian',
    name: 'Indian Summer Monsoon',
    lat: 22.0,
    lng: 80.0,
    precipitation: 1200,
    windSpeed: 35,
    humidity: 88,
    cloudCover: 85,
    onsetDate: 'June 1',
    status: 'active',
    description: 'South Asia - Most intense monsoon system',
  },
  {
    id: 'mn-wafrican',
    name: 'West African Monsoon',
    lat: 10.0,
    lng: -5.0,
    precipitation: 850,
    windSpeed: 22,
    humidity: 78,
    cloudCover: 72,
    onsetDate: 'May 20',
    status: 'active',
    description: 'Sahel region - ITCZ migration driven',
  },
  {
    id: 'mn-easian',
    name: 'East Asian Monsoon',
    lat: 30.0,
    lng: 115.0,
    precipitation: 950,
    windSpeed: 28,
    humidity: 82,
    cloudCover: 78,
    onsetDate: 'May 15',
    status: 'break',
    description: 'China/Japan - Meiyu/Baiu front system',
  },
  {
    id: 'mn-australian',
    name: 'Australian Monsoon',
    lat: -15.0,
    lng: 135.0,
    precipitation: 680,
    windSpeed: 25,
    humidity: 75,
    cloudCover: 68,
    onsetDate: 'December 15',
    status: 'withdrawal',
    description: 'Northern Australia - Wet season dynamics',
  },
  {
    id: 'mn-namerican',
    name: 'North American Monsoon',
    lat: 28.0,
    lng: -110.0,
    precipitation: 420,
    windSpeed: 18,
    humidity: 65,
    cloudCover: 55,
    onsetDate: 'July 1',
    status: 'onset',
    description: 'SW USA/Mexico - Desert monsoon',
  },
  {
    id: 'mn-samerican',
    name: 'South American Monsoon',
    lat: -12.0,
    lng: -55.0,
    precipitation: 1100,
    windSpeed: 20,
    humidity: 85,
    cloudCover: 80,
    onsetDate: 'October 15',
    status: 'pre_onset',
    description: 'Amazon Basin - South Atlantic convergence',
  },
]

const STATUS_CONFIG: Record<
  MonsoonData['status'],
  { label: string; color: string; bgClass: string }
> = {
  pre_onset: { label: 'Pre-Onset', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  onset: { label: 'Onset', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  break: { label: 'Break', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  withdrawal: { label: 'Withdrawal', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

const REGION_OPTIONS: { value: MonsoonState['regionFilter']; label: string }[] = [
  { value: 'all', label: 'All Regions' },
  { value: 'asian', label: 'Asian' },
  { value: 'african', label: 'African' },
  { value: 'american', label: 'American' },
  { value: 'australian', label: 'Australian' },
]

function getRegion(system: MonsoonData): MonsoonState['regionFilter'] {
  if (system.id.includes('indian') || system.id.includes('easian')) return 'asian'
  if (system.id.includes('wafrican')) return 'african'
  if (system.id.includes('namerican') || system.id.includes('samerican')) return 'american'
  if (system.id.includes('australian')) return 'australian'
  return 'all'
}

export function MonsoonTracker() {
  const state = useMapStore((s) => s.monsoon)
  const setState = useMapStore.getState().setMonsoon

  // Initialize demo data on mount if systems array is empty
  useEffect(() => {
    if (useMapStore.getState().monsoon.systems.length === 0) {
      useMapStore.getState().setMonsoon({ systems: DEMO_SYSTEMS })
    }
  }, [])

  const systems = useMemo(
    () => (state.systems.length > 0 ? state.systems : DEMO_SYSTEMS),
    [state.systems]
  )

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      if (state.regionFilter !== 'all' && getRegion(s) !== state.regionFilter) return false
      return true
    })
  }, [systems, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredSystems.length === 0) {
      return { avgPrecipitation: 0, avgHumidity: 0, activeCount: 0 }
    }
    const avgPrecipitation = filteredSystems.reduce((sum, s) => sum + s.precipitation, 0) / filteredSystems.length
    const avgHumidity = filteredSystems.reduce((sum, s) => sum + s.humidity, 0) / filteredSystems.length
    const activeCount = filteredSystems.filter((s) => s.status === 'active').length
    return {
      avgPrecipitation: Math.round(avgPrecipitation),
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      activeCount,
    }
  }, [filteredSystems])

  const activeSystem = useMemo(
    () => systems.find((s) => s.id === state.activeSystemId) ?? null,
    [systems, state.activeSystemId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MonsoonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPrecipitation', label: 'Precipitation', icon: Droplets },
    { key: 'showWindPattern', label: 'Wind Pattern', icon: Wind },
    { key: 'showHumidity', label: 'Humidity', icon: CloudRainIcon2 },
    { key: 'showCloudCover', label: 'Cloud Cover', icon: Cloud },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-blue-950/95 to-sky-950/95 backdrop-blur-xl border border-blue-800/50 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <CloudRainIcon2 className="h-4 w-4 text-blue-400" />
              Monsoon Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-white hover:bg-blue-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as MonsoonState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/50 border-blue-700/50 text-blue-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
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

          <Separator className="bg-blue-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Avg Precipitation</div>
              <div className="text-sm font-semibold text-blue-100">{summary.avgPrecipitation}</div>
              <div className="text-[9px] text-blue-400">mm</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Avg Humidity</div>
              <div className="text-sm font-semibold text-blue-100">{summary.avgHumidity}%</div>
              <div className="text-[9px] text-blue-400">relative</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-300">Active</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-blue-400">systems</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* System List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Monsoon Systems ({filteredSystems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSystems.map((system) => {
                  const isActive = state.activeSystemId === system.id
                  const statusCfg = STATUS_CONFIG[system.status]
                  return (
                    <div
                      key={system.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-400/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
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
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{system.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showPrecipitation && (
                          <div>
                            Precip:{' '}
                            <span className="text-blue-100 font-medium">
                              {system.precipitation}mm
                            </span>
                          </div>
                        )}
                        {state.showWindPattern && (
                          <div>
                            Wind:{' '}
                            <span className="text-blue-100 font-medium">
                              {system.windSpeed}km/h
                            </span>
                          </div>
                        )}
                        {state.showHumidity && (
                          <div>
                            Humidity:{' '}
                            <span className="text-blue-100 font-medium">
                              {system.humidity}%
                            </span>
                          </div>
                        )}
                        {state.showCloudCover && (
                          <div>
                            Cloud:{' '}
                            <span className="text-blue-100 font-medium">
                              {system.cloudCover}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSystems.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No systems match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active System Details */}
          {activeSystem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeSystem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSystem.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSystem.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] text-blue-300 italic">{activeSystem.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeSystem.lat.toFixed(1)}, {activeSystem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Onset Date: </span>
                    <span className="font-medium text-blue-100">{activeSystem.onsetDate}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Precipitation: </span>
                    <span className="font-medium text-blue-100">{activeSystem.precipitation}mm</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Wind Speed: </span>
                    <span className="font-medium text-blue-100">{activeSystem.windSpeed}km/h</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Humidity: </span>
                    <span className="font-medium text-blue-100">{activeSystem.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Cloud Cover: </span>
                    <span className="font-medium text-blue-100">{activeSystem.cloudCover}%</span>
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
