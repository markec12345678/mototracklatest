'use client'

import { useMemo, useState } from 'react'
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
import { useMapStore, type SubglacialLakeState, type SubglacialLake } from '@/lib/map-store'
import { Waves, Thermometer, MountainSnow, Droplets, X, Filter, ChevronDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const DEMO_LAKES: SubglacialLake[] = [
  {
    id: 'sl-vostok',
    name: 'Lake Vostok',
    depth: 800,
    waterTemp: -3.0,
    iceThickness: 3750,
    dissolvedOxygen: 12.5,
    status: 'active_research',
    latitude: -77.0,
    longitude: 105.0,
  },
  {
    id: 'sl-ellsworth',
    name: 'Lake Ellsworth',
    depth: 150,
    waterTemp: -2.8,
    iceThickness: 3200,
    dissolvedOxygen: 8.2,
    status: 'dormant',
    latitude: -79.0,
    longitude: -78.5,
  },
  {
    id: 'sl-whillans',
    name: 'Subglacial Lake Whillans',
    depth: 60,
    waterTemp: -0.5,
    iceThickness: 800,
    dissolvedOxygen: 15.3,
    status: 'active_research',
    latitude: -84.0,
    longitude: -153.0,
  },
  {
    id: 'sl-90e',
    name: 'Lake 90°E',
    depth: 450,
    waterTemp: -2.5,
    iceThickness: 3500,
    dissolvedOxygen: 6.1,
    status: 'unexplored',
    latitude: -78.5,
    longitude: 90.0,
  },
  {
    id: 'sl-sovetskaya',
    name: 'Lake Sovetskaya',
    depth: 600,
    waterTemp: -2.9,
    iceThickness: 3600,
    dissolvedOxygen: 7.8,
    status: 'unexplored',
    latitude: -78.0,
    longitude: 88.0,
  },
  {
    id: 'sl-cecilia',
    name: 'Lake Cecilia',
    depth: 200,
    waterTemp: -1.2,
    iceThickness: 2900,
    dissolvedOxygen: 10.4,
    status: 'dormant',
    latitude: -76.5,
    longitude: -60.0,
  },
]

const STATUS_CONFIG: Record<
  SubglacialLake['status'],
  { label: string; color: string; bgClass: string }
> = {
  active_research: { label: 'Active Research', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  dormant: { label: 'Dormant', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unexplored: { label: 'Unexplored', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

const DEPTH_PROFILE_DATA = [
  { depth: 0, temperature: -35, pressure: 0, oxygen: 0 },
  { depth: 500, temperature: -20, pressure: 5.5, oxygen: 2.1 },
  { depth: 1000, temperature: -12, pressure: 11.0, oxygen: 4.8 },
  { depth: 1500, temperature: -8, pressure: 16.5, oxygen: 6.3 },
  { depth: 2000, temperature: -5, pressure: 22.0, oxygen: 8.0 },
  { depth: 2500, temperature: -3.5, pressure: 27.5, oxygen: 9.5 },
  { depth: 3000, temperature: -3.2, pressure: 33.0, oxygen: 10.8 },
  { depth: 3500, temperature: -3.0, pressure: 38.5, oxygen: 12.0 },
  { depth: 3750, temperature: -3.0, pressure: 41.3, oxygen: 12.5 },
]

export function SubglacialLakeExplorer() {
  const subglacialLake = useMapStore((s) => s.subglacialLake)
  const setSubglacialLake = useMapStore((s) => s.setSubglacialLake)

  const [chartMode, setChartMode] = useState<'depth' | 'comparison'>('depth')

  const lakes = useMemo(
    () => (subglacialLake.lakes && subglacialLake.lakes.length > 0 ? subglacialLake.lakes : DEMO_LAKES),
    [subglacialLake.lakes]
  )

  const filteredLakes = useMemo(() => {
    return lakes.filter((l) => {
      if (subglacialLake.statusFilter !== 'all' && l.status !== subglacialLake.statusFilter) return false
      return true
    })
  }, [lakes, subglacialLake.statusFilter])

  const summary = useMemo(() => {
    if (!filteredLakes || filteredLakes.length === 0) {
      return { avgDepth: 0, avgTemp: 0, avgIceThickness: 0, activeCount: 0 }
    }
    const avgDepth = Math.round(filteredLakes.reduce((s, l) => s + l.depth, 0) / filteredLakes.length)
    const avgTemp = Math.round((filteredLakes.reduce((s, l) => s + l.waterTemp, 0) / filteredLakes.length) * 10) / 10
    const avgIceThickness = Math.round(filteredLakes.reduce((s, l) => s + l.iceThickness, 0) / filteredLakes.length)
    const activeCount = filteredLakes.filter((l) => l.status === 'active_research').length
    return { avgDepth, avgTemp, avgIceThickness, activeCount }
  }, [filteredLakes])

  const activeLake = useMemo(
    () => (lakes && lakes.length > 0 ? lakes.find((l) => l.id === subglacialLake.activeLakeId) ?? null : null),
    [lakes, subglacialLake.activeLakeId]
  )

  if (typeof window === 'undefined') return null
  if (!subglacialLake.open) return null

  const overlayToggles: { key: keyof SubglacialLakeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: ChevronDown },
    { key: 'showWaterTemp', label: 'Water Temp', icon: Thermometer },
    { key: 'showIceThickness', label: 'Ice Thickness', icon: MountainSnow },
    { key: 'showDissolvedOxygen', label: 'Dissolved O₂', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              Subglacial Lake Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSubglacialLake({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Lake Status
            </Label>
            <Select
              value={subglacialLake.statusFilter}
              onValueChange={(v) =>
                setSubglacialLake({
                  statusFilter: v as SubglacialLakeState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active_research">Active Research</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="unexplored">Unexplored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold">{summary.avgDepth} m</div>
            </div>
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Temp</div>
              <div className="text-sm font-semibold">{summary.avgTemp}°C</div>
            </div>
            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Ice Thickness</div>
              <div className="text-sm font-semibold">{summary.avgIceThickness} m</div>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Active Research</div>
              <div className="text-sm font-semibold">{summary.activeCount}</div>
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
                    checked={subglacialLake[t.key] as boolean}
                    onCheckedChange={(checked) => setSubglacialLake({ [t.key]: checked })}
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
              variant={chartMode === 'depth' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('depth')}
            >
              Depth Profile
            </Button>
            <Button
              variant={chartMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('comparison')}
            >
              Lake Comparison
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'depth' ? (
                <AreaChart data={DEPTH_PROFILE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="depth" tick={{ fontSize: 10 }} label={{ value: 'Depth (m)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="temperature" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} name="Temperature (°C)" />
                  <Area type="monotone" dataKey="oxygen" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Dissolved O₂ (mg/L)" />
                </AreaChart>
              ) : (
                <LineChart data={filteredLakes.map((l) => ({ name: l.name.replace('Lake ', '').replace('Subglacial Lake ', 'SL '), depth: l.depth, ice: l.iceThickness / 10, oxygen: l.dissolvedOxygen }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="depth" stroke="#06b6d4" name="Depth (m)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="ice" stroke="#6366f1" name="Ice Thick. (×10m)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="oxygen" stroke="#8b5cf6" name="O₂ (mg/L)" dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Lake List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Lakes ({filteredLakes.length})
            </Label>
            <ScrollArea className="max-h-52">
              <div className="space-y-1.5">
                {(filteredLakes && filteredLakes.length > 0) ? filteredLakes.map((lake) => {
                  const statusCfg = STATUS_CONFIG[lake.status]
                  const isActive = activeLake?.id === lake.id
                  return (
                    <div
                      key={lake.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-border/50 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                      }`}
                      onClick={() => setSubglacialLake({ activeLakeId: isActive ? null : lake.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{lake.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusCfg.bgClass}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {subglacialLake.showDepth && <span>Depth: {lake.depth}m</span>}
                        {subglacialLake.showWaterTemp && <span>Temp: {lake.waterTemp}°C</span>}
                        {subglacialLake.showIceThickness && <span>Ice: {lake.iceThickness}m</span>}
                        {subglacialLake.showDissolvedOxygen && <span>O₂: {lake.dissolvedOxygen}mg/L</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No lakes match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Lake Detail */}
          {activeLake && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-cyan-500" />
                  {activeLake.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <ChevronDown className="h-3 w-3 text-cyan-600" />
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-medium">{activeLake.depth} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{activeLake.waterTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MountainSnow className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Ice:</span>
                    <span className="font-medium">{activeLake.iceThickness} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-violet-500" />
                    <span className="text-muted-foreground">O₂:</span>
                    <span className="font-medium">{activeLake.dissolvedOxygen} mg/L</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeLake.latitude.toFixed(2)}°, {activeLake.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
