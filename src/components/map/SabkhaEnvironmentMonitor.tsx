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
import { useMapStore, type SabkhaEnvironmentState, type SabkhaZone } from '@/lib/map-store'
import { Sun, Droplets, Gem, Wind, X, Filter } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const DEMO_ZONES: SabkhaZone[] = [
  {
    id: 'sb-persian',
    name: 'Persian Gulf Sabkha',
    salinity: 280,
    evaporationRate: 12.5,
    crustThickness: 45,
    mineralType: 'halite',
    latitude: 25.5,
    longitude: 50.8,
  },
  {
    id: 'sb-baja',
    name: 'Baja California Salt Flat',
    salinity: 320,
    evaporationRate: 14.2,
    crustThickness: 62,
    mineralType: 'gypsum',
    latitude: 27.9,
    longitude: -114.4,
  },
  {
    id: 'sb-namib',
    name: 'Namib Coastal Sabkha',
    salinity: 180,
    evaporationRate: 8.9,
    crustThickness: 28,
    mineralType: 'anhydrite',
    latitude: -23.1,
    longitude: 14.5,
  },
  {
    id: 'sb-sinai',
    name: 'Sinai Coastal Flat',
    salinity: 350,
    evaporationRate: 15.8,
    crustThickness: 78,
    mineralType: 'dolomite',
    latitude: 29.8,
    longitude: 33.2,
  },
  {
    id: 'sb-western',
    name: 'Western Australia Sabkha',
    salinity: 240,
    evaporationRate: 11.3,
    crustThickness: 35,
    mineralType: 'halite',
    latitude: -22.5,
    longitude: 114.1,
  },
]

const MINERAL_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  halite: { label: 'Halite', color: '#e2e8f0', bgClass: 'bg-slate-400/10 text-slate-600 border-slate-400/30' },
  gypsum: { label: 'Gypsum', color: '#fbbf24', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  anhydrite: { label: 'Anhydrite', color: '#a78bfa', bgClass: 'bg-violet-400/10 text-violet-600 border-violet-400/30' },
  dolomite: { label: 'Dolomite', color: '#6ee7b7', bgClass: 'bg-emerald-400/10 text-emerald-600 border-emerald-400/30' },
}

const SEASONAL_DATA = [
  { month: 'Jan', salinity: 220, evaporation: 6, crust: 30 },
  { month: 'Feb', salinity: 230, evaporation: 7, crust: 32 },
  { month: 'Mar', salinity: 250, evaporation: 9, crust: 36 },
  { month: 'Apr', salinity: 270, evaporation: 11, crust: 40 },
  { month: 'May', salinity: 290, evaporation: 13, crust: 44 },
  { month: 'Jun', salinity: 320, evaporation: 15, crust: 50 },
  { month: 'Jul', salinity: 340, evaporation: 16, crust: 55 },
  { month: 'Aug', salinity: 350, evaporation: 16, crust: 58 },
  { month: 'Sep', salinity: 310, evaporation: 13, crust: 52 },
  { month: 'Oct', salinity: 280, evaporation: 10, crust: 45 },
  { month: 'Nov', salinity: 250, evaporation: 7, crust: 38 },
  { month: 'Dec', salinity: 225, evaporation: 6, crust: 33 },
]

const MINERAL_COMPOSITION = [
  { name: 'Halite (NaCl)', value: 35, color: '#e2e8f0' },
  { name: 'Gypsum (CaSO₄·2H₂O)', value: 28, color: '#fbbf24' },
  { name: 'Anhydrite (CaSO₄)', value: 18, color: '#a78bfa' },
  { name: 'Dolomite (CaMg(CO₃)₂)', value: 12, color: '#6ee7b7' },
  { name: 'Other', value: 7, color: '#94a3b8' },
]

export function SabkhaEnvironmentMonitor() {
  const sabkhaEnvironment = useMapStore((s) => s.sabkhaEnvironment)
  const setSabkhaEnvironment = useMapStore((s) => s.setSabkhaEnvironment)

  const [chartMode, setChartMode] = useState<'seasonal' | 'mineral'>('seasonal')

  const zones = useMemo(
    () => (sabkhaEnvironment.zones && sabkhaEnvironment.zones.length > 0 ? sabkhaEnvironment.zones : DEMO_ZONES),
    [sabkhaEnvironment.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (sabkhaEnvironment.mineralFilter !== 'all' && z.mineralType !== sabkhaEnvironment.mineralFilter) return false
      return true
    })
  }, [zones, sabkhaEnvironment.mineralFilter])

  const summary = useMemo(() => {
    if (!filteredZones || filteredZones.length === 0) {
      return { avgSalinity: 0, avgEvap: 0, avgCrust: 0, totalZones: 0 }
    }
    const avgSalinity = Math.round(filteredZones.reduce((s, z) => s + z.salinity, 0) / filteredZones.length)
    const avgEvap = Math.round((filteredZones.reduce((s, z) => s + z.evaporationRate, 0) / filteredZones.length) * 10) / 10
    const avgCrust = Math.round(filteredZones.reduce((s, z) => s + z.crustThickness, 0) / filteredZones.length)
    return { avgSalinity, avgEvap, avgCrust, totalZones: filteredZones.length }
  }, [filteredZones])

  const activeZone = useMemo(
    () => (zones && zones.length > 0 ? zones.find((z) => z.id === sabkhaEnvironment.activeZoneId) ?? null : null),
    [zones, sabkhaEnvironment.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!sabkhaEnvironment.open) return null

  const overlayToggles: { key: keyof SabkhaEnvironmentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showEvaporationRate', label: 'Evaporation', icon: Sun },
    { key: 'showCrustThickness', label: 'Crust', icon: Gem },
    { key: 'showMineralType', label: 'Mineral', icon: Wind },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Sabkha Environment Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSabkhaEnvironment({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mineral Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Mineral Type
            </Label>
            <Select
              value={sabkhaEnvironment.mineralFilter}
              onValueChange={(v) =>
                setSabkhaEnvironment({
                  mineralFilter: v as SabkhaEnvironmentState['mineralFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Minerals</SelectItem>
                <SelectItem value="halite">Halite</SelectItem>
                <SelectItem value="gypsum">Gypsum</SelectItem>
                <SelectItem value="anhydrite">Anhydrite</SelectItem>
                <SelectItem value="dolomite">Dolomite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Salinity</div>
              <div className="text-sm font-semibold">{summary.avgSalinity} ppt</div>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Evaporation</div>
              <div className="text-sm font-semibold">{summary.avgEvap} mm/day</div>
            </div>
            <div className="rounded-lg bg-stone-500/5 border border-stone-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Crust</div>
              <div className="text-sm font-semibold">{summary.avgCrust} cm</div>
            </div>
            <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total Zones</div>
              <div className="text-sm font-semibold">{summary.totalZones}</div>
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
                    checked={sabkhaEnvironment[t.key] as boolean}
                    onCheckedChange={(checked) => setSabkhaEnvironment({ [t.key]: checked })}
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
              variant={chartMode === 'seasonal' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('seasonal')}
            >
              Seasonal
            </Button>
            <Button
              variant={chartMode === 'mineral' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('mineral')}
            >
              Mineral Comp.
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'seasonal' ? (
                <LineChart data={SEASONAL_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="salinity" stroke="#f59e0b" name="Salinity (ppt)" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="evaporation" stroke="#ef4444" name="Evap (mm/d)" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="crust" stroke="#78716c" name="Crust (cm)" dot={{ r: 2 }} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={MINERAL_COMPOSITION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {MINERAL_COMPOSITION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Zone List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Sabkha Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredZones && filteredZones.length > 0) ? filteredZones.map((zone) => {
                  const mineralCfg = MINERAL_CONFIG[zone.mineralType] || { label: zone.mineralType, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeZone?.id === zone.id
                  return (
                    <div
                      key={zone.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5'
                      }`}
                      onClick={() => setSabkhaEnvironment({ activeZoneId: isActive ? null : zone.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{zone.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${mineralCfg.bgClass}`}>
                          {mineralCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {sabkhaEnvironment.showSalinity && <span>{zone.salinity} ppt</span>}
                        {sabkhaEnvironment.showEvaporationRate && <span>{zone.evaporationRate} mm/d</span>}
                        {sabkhaEnvironment.showCrustThickness && <span>{zone.crustThickness} cm</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No zones match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Detail */}
          {activeZone && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  {activeZone.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-cyan-500" />
                    <span className="text-muted-foreground">Salinity:</span>
                    <span className="font-medium">{activeZone.salinity} ppt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Evap:</span>
                    <span className="font-medium">{activeZone.evaporationRate} mm/day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gem className="h-3 w-3 text-stone-500" />
                    <span className="text-muted-foreground">Crust:</span>
                    <span className="font-medium">{activeZone.crustThickness} cm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-teal-500" />
                    <span className="text-muted-foreground">Mineral:</span>
                    <span className="font-medium">{(MINERAL_CONFIG[activeZone.mineralType] || { label: activeZone.mineralType }).label}</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeZone.latitude.toFixed(2)}°, {activeZone.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
