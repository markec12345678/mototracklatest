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
import { useMapStore, type PaleoclimateProxyState, type PaleoclimateProxy } from '@/lib/map-store'
import { Clock, Layers, Thermometer, LineChart, X, Filter } from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const DEMO_PROXIES: PaleoclimateProxy[] = [
  {
    id: 'pp-vostok',
    type: 'ice_core',
    ageRange: '0-420 kyr BP',
    resolution: 'Annual',
    tempReconstruction: -55.2,
    latitude: -78.47,
    longitude: 106.83,
  },
  {
    id: 'pp-epica',
    type: 'ice_core',
    ageRange: '0-800 kyr BP',
    resolution: 'Decadal',
    tempReconstruction: -54.8,
    latitude: -75.0,
    longitude: 0.07,
  },
  {
    id: 'pp-bristlecone',
    type: 'tree_ring',
    ageRange: '0-9 kyr BP',
    resolution: 'Annual',
    tempReconstruction: 5.2,
    latitude: 37.5,
    longitude: -118.2,
  },
  {
    id: 'pp-odp982',
    type: 'sediment',
    ageRange: '0-5 Myr BP',
    resolution: 'Millennial',
    tempReconstruction: 12.5,
    latitude: 57.5,
    longitude: -19.7,
  },
  {
    id: 'pp-greatbarrier',
    type: 'coral',
    ageRange: '0-400 yr BP',
    resolution: 'Monthly',
    tempReconstruction: 26.8,
    latitude: -18.3,
    longitude: 147.7,
  },
  {
    id: 'pp-speleothem',
    type: 'speleothem',
    ageRange: '0-250 kyr BP',
    resolution: 'Centennial',
    tempReconstruction: 8.4,
    latitude: 36.5,
    longitude: -4.8,
  },
]

const TYPE_CONFIG: Record<
  PaleoclimateProxy['type'],
  { label: string; color: string; bgClass: string; icon: string }
> = {
  ice_core: { label: 'Ice Core', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', icon: '🧊' },
  tree_ring: { label: 'Tree Ring', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30', icon: '🌳' },
  sediment: { label: 'Sediment', color: '#a16207', bgClass: 'bg-yellow-700/10 text-yellow-700 border-yellow-700/30', icon: '🏔️' },
  coral: { label: 'Coral', color: '#ec4899', bgClass: 'bg-pink-500/10 text-pink-600 border-pink-500/30', icon: '🪸' },
  speleothem: { label: 'Speleothem', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30', icon: '🕯️' },
}

const TEMPERATURE_RECONSTRUCTION = [
  { age: -400, iceCore: -3.2, sediment: -2.8, speleothem: -2.5 },
  { age: -300, iceCore: -1.8, sediment: -1.5, speleothem: -1.2 },
  { age: -200, iceCore: 0.5, sediment: 0.3, speleothem: 0.8 },
  { age: -130, iceCore: 1.2, sediment: 1.0, speleothem: 1.5 },
  { age: -80, iceCore: -0.8, sediment: -0.5, speleothem: -0.3 },
  { age: -25, iceCore: -1.5, sediment: -1.2, speleothem: -1.0 },
  { age: -12, iceCore: 0.2, sediment: 0.1, speleothem: 0.3 },
  { age: -5, iceCore: 0.6, sediment: 0.4, speleothem: 0.5 },
  { age: 0, iceCore: 1.1, sediment: 0.9, speleothem: 1.0 },
]

const CLIMATE_EVENTS = [
  { age: -130, label: 'Last Interglacial', color: '#f59e0b' },
  { age: -25, label: 'LGM', color: '#3b82f6' },
  { age: -11.7, label: 'Holocene Start', color: '#22c55e' },
  { age: -8.2, label: '8.2 ka Event', color: '#ef4444' },
  { age: -5.5, label: 'Mid-Holocene Optimum', color: '#f97316' },
]

export function PaleoclimateProxyExplorer() {
  const paleoclimateProxy = useMapStore((s) => s.paleoclimateProxy)
  const setPaleoclimateProxy = useMapStore((s) => s.setPaleoclimateProxy)

  const [showEvents, setShowEvents] = useState(true)

  const proxies = useMemo(
    () => (paleoclimateProxy.proxies && paleoclimateProxy.proxies.length > 0 ? paleoclimateProxy.proxies : DEMO_PROXIES),
    [paleoclimateProxy.proxies]
  )

  const filteredProxies = useMemo(() => {
    return proxies.filter((p) => {
      if (paleoclimateProxy.typeFilter !== 'all' && p.type !== paleoclimateProxy.typeFilter) return false
      return true
    })
  }, [proxies, paleoclimateProxy.typeFilter])

  const summary = useMemo(() => {
    if (!filteredProxies || filteredProxies.length === 0) {
      return { typeCount: 0, avgTemp: 0, maxAge: '' }
    }
    const types = new Set(filteredProxies.map((p) => p.type))
    const avgTemp = Math.round((filteredProxies.reduce((s, p) => s + p.tempReconstruction, 0) / filteredProxies.length) * 10) / 10
    return { typeCount: types.size, avgTemp, maxAge: '800 kyr BP' }
  }, [filteredProxies])

  const activeProxy = useMemo(
    () => (proxies && proxies.length > 0 ? proxies.find((p) => p.id === paleoclimateProxy.activeProxyId) ?? null : null),
    [proxies, paleoclimateProxy.activeProxyId]
  )

  if (typeof window === 'undefined') return null
  if (!paleoclimateProxy.open) return null

  const overlayToggles: { key: keyof PaleoclimateProxyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAgeRange', label: 'Age Range', icon: Clock },
    { key: 'showResolution', label: 'Resolution', icon: Layers },
    { key: 'showTempReconstruction', label: 'Temp', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <LineChart className="h-4 w-4 text-violet-500" />
              Paleoclimate Proxy Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPaleoclimateProxy({ open: false })}
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
              Proxy Type
            </Label>
            <Select
              value={paleoclimateProxy.typeFilter}
              onValueChange={(v) =>
                setPaleoclimateProxy({
                  typeFilter: v as PaleoclimateProxyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ice_core">Ice Core</SelectItem>
                <SelectItem value="tree_ring">Tree Ring</SelectItem>
                <SelectItem value="sediment">Sediment</SelectItem>
                <SelectItem value="coral">Coral</SelectItem>
                <SelectItem value="speleothem">Speleothem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Proxy Types</div>
              <div className="text-sm font-semibold">{summary.typeCount}</div>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Temp</div>
              <div className="text-sm font-semibold">{summary.avgTemp}°C</div>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Max Age</div>
              <div className="text-sm font-semibold">{summary.maxAge}</div>
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
                    checked={paleoclimateProxy[t.key] as boolean}
                    onCheckedChange={(checked) => setPaleoclimateProxy({ [t.key]: checked })}
                    className="scale-75"
                  />
                  <Label className="text-[10px] flex items-center gap-0.5">
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </Label>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={showEvents}
                  onCheckedChange={setShowEvents}
                  className="scale-75"
                />
                <Label className="text-[10px] flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  Events
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Multi-Proxy Comparison Chart */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Temperature Reconstruction (kyr BP)</Label>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={TEMPERATURE_RECONSTRUCTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: 'Age (kyr BP)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Δ°C', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="iceCore" stroke="#06b6d4" name="Ice Core" dot={{ r: 3 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="sediment" stroke="#a16207" name="Sediment" dot={{ r: 3 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="speleothem" stroke="#8b5cf6" name="Speleothem" dot={{ r: 3 }} strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Climate Events Timeline */}
          {showEvents && (
            <div className="rounded-lg bg-muted/30 border border-border/50 p-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Key Climate Events</Label>
              <div className="space-y-1">
                {CLIMATE_EVENTS.map((evt, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                    <span className="text-muted-foreground">{evt.age} kyr BP</span>
                    <span className="font-medium">{evt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Proxy List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Proxies ({filteredProxies.length})
            </Label>
            <ScrollArea className="max-h-44">
              <div className="space-y-1.5">
                {(filteredProxies && filteredProxies.length > 0) ? filteredProxies.map((proxy) => {
                  const typeCfg = TYPE_CONFIG[proxy.type]
                  const isActive = activeProxy?.id === proxy.id
                  return (
                    <div
                      key={proxy.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-violet-500/50 bg-violet-500/5' : 'border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5'
                      }`}
                      onClick={() => setPaleoclimateProxy({ activeProxyId: isActive ? null : proxy.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <span>{typeCfg.icon}</span>
                          {proxy.id.replace('pp-', '').toUpperCase()}
                        </span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${typeCfg.bgClass}`}>
                          {typeCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {paleoclimateProxy.showAgeRange && <span>{proxy.ageRange}</span>}
                        {paleoclimateProxy.showResolution && <span>Res: {proxy.resolution}</span>}
                        {paleoclimateProxy.showTempReconstruction && <span>T: {proxy.tempReconstruction}°C</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No proxies match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Proxy Detail */}
          {activeProxy && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-violet-500" />
                  {TYPE_CONFIG[activeProxy.type].label} — {activeProxy.id.replace('pp-', '').toUpperCase()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{activeProxy.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Res:</span>
                    <span className="font-medium">{activeProxy.resolution}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{activeProxy.tempReconstruction}°C</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeProxy.latitude.toFixed(2)}°, {activeProxy.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
