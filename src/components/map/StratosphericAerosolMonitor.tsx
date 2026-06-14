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
import { useMapStore, type AerosolLayer, type StratosphericAerosolState } from '@/lib/map-store'
import { Cloud as CloudIcon7, Layers, SunDim, Globe as GlobeIcon3, X, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const DEMO_LAYERS: AerosolLayer[] = [
  {
    id: 'sa-pinatubo',
    name: 'Pinatubo Aftermath',
    altitude: 25,
    opticalDepth: 0.42,
    composition: 'volcanic',
    coverage: 72,
    radiativeEffect: -4.5,
    latitude: 15.14,
    longitude: 120.35,
  },
  {
    id: 'sa-sahara',
    name: 'Sahara Dust Plume',
    altitude: 6,
    opticalDepth: 0.28,
    composition: 'dust',
    coverage: 45,
    radiativeEffect: -1.2,
    latitude: 23.42,
    longitude: 10.17,
  },
  {
    id: 'sa-australian',
    name: 'Australian Smoke',
    altitude: 15,
    opticalDepth: 0.15,
    composition: 'biomass',
    coverage: 30,
    radiativeEffect: -0.8,
    latitude: -33.87,
    longitude: 151.21,
  },
  {
    id: 'sa-icelandic',
    name: 'Icelandic Sulfate',
    altitude: 12,
    opticalDepth: 0.08,
    composition: 'sulfate',
    coverage: 18,
    radiativeEffect: -0.4,
    latitude: 64.13,
    longitude: -21.90,
  },
  {
    id: 'sa-kamchatka',
    name: 'Kamchatka Volcanic',
    altitude: 20,
    opticalDepth: 0.35,
    composition: 'volcanic',
    coverage: 55,
    radiativeEffect: -3.2,
    latitude: 56.06,
    longitude: 159.44,
  },
]

const COMPOSITION_CONFIG: Record<string, { label: string; bgClass: string }> = {
  sulfate: { label: 'Sulfate', bgClass: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
  volcanic: { label: 'Volcanic', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  dust: { label: 'Dust', bgClass: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  biomass: { label: 'Biomass', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const ALTITUDE_VS_OD_DATA = [
  { altitude: 2, opticalDepth: 0.02 },
  { altitude: 5, opticalDepth: 0.08 },
  { altitude: 8, opticalDepth: 0.15 },
  { altitude: 12, opticalDepth: 0.22 },
  { altitude: 15, opticalDepth: 0.30 },
  { altitude: 18, opticalDepth: 0.35 },
  { altitude: 20, opticalDepth: 0.32 },
  { altitude: 23, opticalDepth: 0.38 },
  { altitude: 25, opticalDepth: 0.42 },
  { altitude: 28, opticalDepth: 0.35 },
  { altitude: 30, opticalDepth: 0.28 },
]

const RADIATIVE_DATA = DEMO_LAYERS.map((l) => ({
  name: l.name.split(' ')[0],
  effect: Math.abs(l.radiativeEffect),
}))

export function StratosphericAerosolMonitor() {
  const stratosphericAerosol = useMapStore((s) => s.stratosphericAerosol)
  const setStratosphericAerosol = useMapStore((s) => s.setStratosphericAerosol)

  const [chartMode, setChartMode] = useState<'altitude' | 'radiative'>('altitude')

  const layers = useMemo(
    () => (stratosphericAerosol.layers && stratosphericAerosol.layers.length > 0 ? stratosphericAerosol.layers : DEMO_LAYERS),
    [stratosphericAerosol.layers]
  )

  const filteredLayers = useMemo(() => {
    return layers.filter((l) => {
      if (stratosphericAerosol.compositionFilter !== 'all' && l.composition !== stratosphericAerosol.compositionFilter) return false
      return true
    })
  }, [layers, stratosphericAerosol.compositionFilter])

  const summary = useMemo(() => {
    if (!filteredLayers || filteredLayers.length === 0) {
      return { avgOpticalDepth: 0, avgAltitude: 0, avgRadiativeEffect: 0 }
    }
    const avgOpticalDepth = Math.round((filteredLayers.reduce((s, l) => s + l.opticalDepth, 0) / filteredLayers.length) * 100) / 100
    const avgAltitude = Math.round(filteredLayers.reduce((s, l) => s + l.altitude, 0) / filteredLayers.length)
    const avgRadiativeEffect = Math.round((filteredLayers.reduce((s, l) => s + l.radiativeEffect, 0) / filteredLayers.length) * 100) / 100
    return { avgOpticalDepth, avgAltitude, avgRadiativeEffect }
  }, [filteredLayers])

  const activeLayer = useMemo(
    () => (layers && layers.length > 0 ? layers.find((l) => l.id === stratosphericAerosol.activeLayerId) ?? null : null),
    [layers, stratosphericAerosol.activeLayerId]
  )

  if (typeof window === 'undefined') return null
  if (!stratosphericAerosol.open) return null

  const overlayToggles: { key: keyof StratosphericAerosolState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOpticalDepth', label: 'Opt. Depth', icon: Layers },
    { key: 'showAltitude', label: 'Altitude', icon: SunDim },
    { key: 'showCoverage', label: 'Coverage', icon: GlobeIcon3 },
    { key: 'showRadiativeEffect', label: 'Rad. Effect', icon: CloudIcon7 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudIcon7 className="h-4 w-4 text-gray-500" />
              Stratospheric Aerosol Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setStratosphericAerosol({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Composition Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Composition
            </Label>
            <Select
              value={stratosphericAerosol.compositionFilter}
              onValueChange={(v) =>
                setStratosphericAerosol({
                  compositionFilter: v as StratosphericAerosolState['compositionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Compositions</SelectItem>
                <SelectItem value="sulfate">Sulfate</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="dust">Dust</SelectItem>
                <SelectItem value="biomass">Biomass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-gray-500/5 border border-gray-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Opt. Depth</div>
              <div className="text-sm font-semibold">{summary.avgOpticalDepth}</div>
            </div>
            <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Altitude</div>
              <div className="text-sm font-semibold">{summary.avgAltitude} km</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Rad. Effect</div>
              <div className="text-sm font-semibold">{summary.avgRadiativeEffect} W/m²</div>
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
                    checked={stratosphericAerosol[t.key] as boolean}
                    onCheckedChange={(checked) => setStratosphericAerosol({ [t.key]: checked })}
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
              variant={chartMode === 'altitude' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('altitude')}
            >
              Altitude vs OD
            </Button>
            <Button
              variant={chartMode === 'radiative' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('radiative')}
            >
              Radiative Effects
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'altitude' ? (
                <AreaChart data={ALTITUDE_VS_OD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="altitude" tick={{ fontSize: 10 }} label={{ value: 'Altitude (km)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Opt. Depth', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="opticalDepth" stroke="#6b7280" fill="#6b7280" fillOpacity={0.2} name="Optical Depth" />
                </AreaChart>
              ) : (
                <BarChart data={RADIATIVE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'W/m²', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="effect" fill="#ef4444" name="Radiative Effect (|W/m²|)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Layer List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Aerosol Layers ({filteredLayers.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredLayers && filteredLayers.length > 0) ? filteredLayers.map((layer) => {
                  const compCfg = COMPOSITION_CONFIG[layer.composition] || { label: layer.composition, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeLayer?.id === layer.id
                  return (
                    <div
                      key={layer.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-gray-500/50 bg-gray-500/5' : 'border-border/50 hover:border-gray-500/30 hover:bg-gray-500/5'
                      }`}
                      onClick={() => setStratosphericAerosol({ activeLayerId: isActive ? null : layer.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{layer.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${compCfg.bgClass}`}>
                          {compCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {stratosphericAerosol.showAltitude && <span>{layer.altitude} km</span>}
                        {stratosphericAerosol.showOpticalDepth && <span>OD: {layer.opticalDepth}</span>}
                        {stratosphericAerosol.showCoverage && <span>{layer.coverage}%</span>}
                        {stratosphericAerosol.showRadiativeEffect && <span>{layer.radiativeEffect} W/m²</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No layers match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Layer Detail */}
          {activeLayer && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <CloudIcon7 className="h-3.5 w-3.5 text-gray-500" />
                  {activeLayer.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-gray-600" />
                    <span className="text-muted-foreground">Altitude:</span>
                    <span className="font-medium">{activeLayer.altitude} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudIcon7 className="h-3 w-3 text-gray-600" />
                    <span className="text-muted-foreground">Opt. Depth:</span>
                    <span className="font-medium">{activeLayer.opticalDepth}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SunDim className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Coverage:</span>
                    <span className="font-medium">{activeLayer.coverage}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GlobeIcon3 className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">Rad. Effect:</span>
                    <span className="font-medium">{activeLayer.radiativeEffect} W/m²</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Optical Depth Intensity</span>
                    <span className="text-[10px] font-medium">{activeLayer.opticalDepth > 0.3 ? 'High' : activeLayer.opticalDepth > 0.15 ? 'Moderate' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, activeLayer.opticalDepth * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeLayer.latitude.toFixed(2)}°, {activeLayer.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
