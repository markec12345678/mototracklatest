'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type MesoscaleEddy, type OceanEddyState } from '@/lib/map-store'
import { Waves as WavesIcon8, Thermometer, Compass, Clock, X, Filter } from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts'

const DEMO_EDDIES: MesoscaleEddy[] = [
  {
    id: 'oe-gulfstream',
    name: 'Gulf Stream Warm Core',
    eddyType: 'anticyclonic',
    radius: 150,
    maxVelocity: 85,
    temperatureAnomaly: 3.2,
    lifetime: 240,
    latitude: 38.5,
    longitude: -62.0,
  },
  {
    id: 'oe-agulhas',
    name: 'Agulhas Retroflection',
    eddyType: 'anticyclonic',
    radius: 200,
    maxVelocity: 120,
    temperatureAnomaly: 4.5,
    lifetime: 365,
    latitude: -38.0,
    longitude: 18.0,
  },
  {
    id: 'oe-kuroshio',
    name: 'Kuroshio Extension',
    eddyType: 'cyclonic',
    radius: 120,
    maxVelocity: 95,
    temperatureAnomaly: -2.8,
    lifetime: 180,
    latitude: 35.0,
    longitude: 148.0,
  },
  {
    id: 'oe-brazil',
    name: 'Brazil-Malvinas',
    eddyType: 'cyclonic',
    radius: 180,
    maxVelocity: 75,
    temperatureAnomaly: -3.5,
    lifetime: 300,
    latitude: -40.0,
    longitude: -52.0,
  },
  {
    id: 'oe-eastaus',
    name: 'East Australian Current',
    eddyType: 'anticyclonic',
    radius: 160,
    maxVelocity: 90,
    temperatureAnomaly: 2.5,
    lifetime: 210,
    latitude: -32.0,
    longitude: 154.0,
  },
]

const EDDY_TYPE_CONFIG: Record<string, { label: string; bgClass: string }> = {
  cyclonic: { label: 'Cyclonic', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  anticyclonic: { label: 'Anticyclonic', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SCATTER_DATA = DEMO_EDDIES.map((e) => ({
  radius: e.radius,
  velocity: e.maxVelocity,
  name: e.name.split(' ').slice(0, 2).join(' '),
}))

const TEMP_ANOMALY_DATA = [
  { day: 0, anomaly: 0 },
  { day: 30, anomaly: 0.8 },
  { day: 60, anomaly: 1.5 },
  { day: 90, anomaly: 2.2 },
  { day: 120, anomaly: 2.8 },
  { day: 150, anomaly: 3.0 },
  { day: 180, anomaly: 2.7 },
  { day: 210, anomaly: 2.2 },
  { day: 240, anomaly: 1.6 },
  { day: 270, anomaly: 1.0 },
  { day: 300, anomaly: 0.5 },
  { day: 330, anomaly: 0.2 },
  { day: 365, anomaly: 0 },
]

export function OceanMesoscaleEddyTracker() {
  const oceanEddy = useMapStore((s) => s.oceanEddy)
  const setOceanEddy = useMapStore((s) => s.setOceanEddy)

  const [chartMode, setChartMode] = useState<'scatter' | 'anomaly'>('scatter')

  const eddies = useMemo(
    () => (oceanEddy.eddies && oceanEddy.eddies.length > 0 ? oceanEddy.eddies : DEMO_EDDIES),
    [oceanEddy.eddies]
  )

  const filteredEddies = useMemo(() => {
    return eddies.filter((e) => {
      if (oceanEddy.typeFilter !== 'all' && e.eddyType !== oceanEddy.typeFilter) return false
      return true
    })
  }, [eddies, oceanEddy.typeFilter])

  const summary = useMemo(() => {
    if (!filteredEddies || filteredEddies.length === 0) {
      return { avgRadius: 0, avgVelocity: 0, totalEddies: 0 }
    }
    const avgRadius = Math.round(filteredEddies.reduce((s, e) => s + e.radius, 0) / filteredEddies.length)
    const avgVelocity = Math.round(filteredEddies.reduce((s, e) => s + e.maxVelocity, 0) / filteredEddies.length)
    const totalEddies = filteredEddies.length
    return { avgRadius, avgVelocity, totalEddies }
  }, [filteredEddies])

  const activeEddy = useMemo(
    () => (eddies && eddies.length > 0 ? eddies.find((e) => e.id === oceanEddy.activeEddyId) ?? null : null),
    [eddies, oceanEddy.activeEddyId]
  )

  if (typeof window === 'undefined') return null
  if (!oceanEddy.open) return null

  const overlayToggles: { key: keyof OceanEddyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRadius', label: 'Radius', icon: Compass },
    { key: 'showVelocity', label: 'Velocity', icon: Thermometer },
    { key: 'showTempAnomaly', label: 'Temp Anomaly', icon: Thermometer },
    { key: 'showLifetime', label: 'Lifetime', icon: Clock },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon8 className="h-4 w-4 text-blue-500" />
              Ocean Mesoscale Eddy Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOceanEddy({ open: false })}
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
              Eddy Type
            </Label>
            <Select
              value={oceanEddy.typeFilter}
              onValueChange={(v) =>
                setOceanEddy({
                  typeFilter: v as OceanEddyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cyclonic">Cyclonic</SelectItem>
                <SelectItem value="anticyclonic">Anticyclonic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Radius</div>
              <div className="text-sm font-semibold">{summary.avgRadius} km</div>
            </div>
            <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Velocity</div>
              <div className="text-sm font-semibold">{summary.avgVelocity} cm/s</div>
            </div>
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total Eddies</div>
              <div className="text-sm font-semibold">{summary.totalEddies}</div>
            </div>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Display Options</Label>
            <div className="flex flex-wrap gap-2">
              {overlayToggles.map((t) => (
                <div key={t.key} className="flex items-center gap-1.5">
                  <Switch
                    checked={oceanEddy[t.key] as boolean}
                    onCheckedChange={(checked) => setOceanEddy({ [t.key]: checked })}
                    className="scale-75"
                  />
                  <Label className="text-[10px] flex items-center gap-0.5">
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Chart Mode Toggle */}
          <div className="flex gap-1">
            <Button
              variant={chartMode === 'scatter' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('scatter')}
            >
              Radius vs Velocity
            </Button>
            <Button
              variant={chartMode === 'anomaly' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('anomaly')}
            >
              Temp Anomaly
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="radius" tick={{ fontSize: 10 }} label={{ value: 'Radius (km)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis dataKey="velocity" tick={{ fontSize: 10 }} label={{ value: 'cm/s', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Eddies" data={SCATTER_DATA} fill="#3b82f6" />
                </ScatterChart>
              ) : (
                <AreaChart data={TEMP_ANOMALY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} label={{ value: 'Day', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="anomaly" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Temp Anomaly (°C)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Eddy List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Mesoscale Eddies ({filteredEddies.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredEddies && filteredEddies.length > 0) ? filteredEddies.map((eddy) => {
                  const typeCfg = EDDY_TYPE_CONFIG[eddy.eddyType] || { label: eddy.eddyType, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeEddy?.id === eddy.id
                  return (
                    <div
                      key={eddy.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-blue-500/50 bg-blue-500/5' : 'border-border/50 hover:border-blue-500/30 hover:bg-blue-500/5'
                      }`}
                      onClick={() => setOceanEddy({ activeEddyId: isActive ? null : eddy.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{eddy.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${typeCfg.bgClass}`}>
                          {typeCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {oceanEddy.showRadius && <span>{eddy.radius} km</span>}
                        {oceanEddy.showVelocity && <span>{eddy.maxVelocity} cm/s</span>}
                        {oceanEddy.showTempAnomaly && <span>{eddy.temperatureAnomaly > 0 ? '+' : ''}{eddy.temperatureAnomaly}°C</span>}
                        {oceanEddy.showLifetime && <span>{eddy.lifetime} days</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No eddies match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Eddy Detail */}
          {activeEddy && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <WavesIcon8 className="h-3.5 w-3.5 text-blue-500" />
                  {activeEddy.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Compass className="h-3 w-3 text-blue-600" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{EDDY_TYPE_CONFIG[activeEddy.eddyType]?.label ?? activeEddy.eddyType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Compass className="h-3 w-3 text-teal-500" />
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-medium">{activeEddy.radius} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Max Vel:</span>
                    <span className="font-medium">{activeEddy.maxVelocity} cm/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Temp Anom:</span>
                    <span className="font-medium">{activeEddy.temperatureAnomaly > 0 ? '+' : ''}{activeEddy.temperatureAnomaly}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span className="text-muted-foreground">Lifetime:</span>
                    <span className="font-medium">{activeEddy.lifetime} days</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Eddy Intensity</span>
                    <span className="text-[10px] font-medium">{activeEddy.maxVelocity > 100 ? 'Very Strong' : activeEddy.maxVelocity > 80 ? 'Strong' : activeEddy.maxVelocity > 50 ? 'Moderate' : 'Weak'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeEddy.maxVelocity / 150) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeEddy.latitude.toFixed(2)}°, {activeEddy.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
