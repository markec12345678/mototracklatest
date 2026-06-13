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
import { useMapStore, type AbyssalPlainState, type AbyssalFeature } from '@/lib/map-store'
import { Waves, Anchor, Fish, Gem, X, Filter } from 'lucide-react'
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

const DEMO_FEATURES: AbyssalFeature[] = [
  {
    id: 'ap-clarion',
    name: 'Clarion-Clipperton Zone',
    depth: 4500,
    sedimentType: 'clay',
    noduleDensity: 12.5,
    biodiversityIndex: 0.42,
    latitude: 15.0,
    longitude: -155.0,
  },
  {
    id: 'ap-peru',
    name: 'Peru Basin Nodule Field',
    depth: 4200,
    sedimentType: 'ooze',
    noduleDensity: 8.3,
    biodiversityIndex: 0.55,
    latitude: -10.0,
    longitude: -100.0,
  },
  {
    id: 'ap-midatlantic',
    name: 'Mid-Atlantic Ridge Plain',
    depth: 3800,
    sedimentType: 'turbidite',
    noduleDensity: 3.2,
    biodiversityIndex: 0.68,
    latitude: 5.0,
    longitude: -30.0,
  },
  {
    id: 'ap-southern',
    name: 'Southern Ocean Abyssal Plain',
    depth: 5200,
    sedimentType: 'diatomaceous',
    noduleDensity: 6.1,
    biodiversityIndex: 0.73,
    latitude: -55.0,
    longitude: 0.0,
  },
  {
    id: 'ap-central',
    name: 'Central Pacific Nodule Belt',
    depth: 4800,
    sedimentType: 'clay',
    noduleDensity: 15.8,
    biodiversityIndex: 0.38,
    latitude: 10.0,
    longitude: -170.0,
  },
]

const SEDIMENT_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  clay: { label: 'Clay', color: '#a16207', bgClass: 'bg-yellow-700/10 text-yellow-700 border-yellow-700/30' },
  ooze: { label: 'Ooze', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  turbidite: { label: 'Turbidite', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
  diatomaceous: { label: 'Diatomaceous', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const DEPTH_PROFILE_DATA = [
  { depth: 0, sediment: 0, nodules: 0, bio: 0.95 },
  { depth: 500, sediment: 10, nodules: 0.5, bio: 0.82 },
  { depth: 1000, sediment: 25, nodules: 1.2, bio: 0.68 },
  { depth: 1500, sediment: 40, nodules: 2.5, bio: 0.55 },
  { depth: 2000, sediment: 55, nodules: 4.8, bio: 0.48 },
  { depth: 2500, sediment: 68, nodules: 7.2, bio: 0.44 },
  { depth: 3000, sediment: 78, nodules: 9.5, bio: 0.42 },
  { depth: 3500, sediment: 85, nodules: 11.0, bio: 0.40 },
  { depth: 4000, sediment: 90, nodules: 12.5, bio: 0.38 },
  { depth: 4500, sediment: 94, nodules: 13.8, bio: 0.36 },
  { depth: 5000, sediment: 97, nodules: 14.2, bio: 0.34 },
]

const RESOURCE_DATA = [
  { feature: 'CCZ', manganese: 28, nickel: 12, copper: 8, cobalt: 3 },
  { feature: 'Peru', manganese: 22, nickel: 9, copper: 6, cobalt: 2 },
  { feature: 'Central', manganese: 30, nickel: 14, copper: 10, cobalt: 4 },
  { feature: 'S. Ocean', manganese: 18, nickel: 7, copper: 4, cobalt: 2 },
  { feature: 'Mid-Atl', manganese: 15, nickel: 5, copper: 3, cobalt: 1 },
]

export function AbyssalPlainMapper() {
  const abyssalPlain = useMapStore((s) => s.abyssalPlain)
  const setAbyssalPlain = useMapStore((s) => s.setAbyssalPlain)

  const [chartMode, setChartMode] = useState<'depth' | 'resource'>('depth')

  const features = useMemo(
    () => (abyssalPlain.features && abyssalPlain.features.length > 0 ? abyssalPlain.features : DEMO_FEATURES),
    [abyssalPlain.features]
  )

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      if (abyssalPlain.sedimentFilter !== 'all' && f.sedimentType !== abyssalPlain.sedimentFilter) return false
      return true
    })
  }, [features, abyssalPlain.sedimentFilter])

  const summary = useMemo(() => {
    if (!filteredFeatures || filteredFeatures.length === 0) {
      return { avgDepth: 0, avgNodule: 0, avgBio: 0 }
    }
    const avgDepth = Math.round(filteredFeatures.reduce((s, f) => s + f.depth, 0) / filteredFeatures.length)
    const avgNodule = Math.round((filteredFeatures.reduce((s, f) => s + f.noduleDensity, 0) / filteredFeatures.length) * 10) / 10
    const avgBio = Math.round((filteredFeatures.reduce((s, f) => s + f.biodiversityIndex, 0) / filteredFeatures.length) * 100) / 100
    return { avgDepth, avgNodule, avgBio }
  }, [filteredFeatures])

  const activeFeature = useMemo(
    () => (features && features.length > 0 ? features.find((f) => f.id === abyssalPlain.activeFeatureId) ?? null : null),
    [features, abyssalPlain.activeFeatureId]
  )

  if (typeof window === 'undefined') return null
  if (!abyssalPlain.open) return null

  const overlayToggles: { key: keyof AbyssalPlainState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Waves },
    { key: 'showSedimentType', label: 'Sediment', icon: Anchor },
    { key: 'showNoduleDensity', label: 'Nodules', icon: Gem },
    { key: 'showBiodiversityIndex', label: 'Biodiversity', icon: Fish },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-teal-500" />
              Abyssal Plain Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAbyssalPlain({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Sediment Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Sediment Type
            </Label>
            <Select
              value={abyssalPlain.sedimentFilter}
              onValueChange={(v) =>
                setAbyssalPlain({
                  sedimentFilter: v as AbyssalPlainState['sedimentFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="clay">Clay</SelectItem>
                <SelectItem value="ooze">Ooze</SelectItem>
                <SelectItem value="turbidite">Turbidite</SelectItem>
                <SelectItem value="diatomaceous">Diatomaceous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold">{summary.avgDepth} m</div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Nodules</div>
              <div className="text-sm font-semibold">{summary.avgNodule} kg/m²</div>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Bio</div>
              <div className="text-sm font-semibold">{summary.avgBio}</div>
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
                    checked={abyssalPlain[t.key] as boolean}
                    onCheckedChange={(checked) => setAbyssalPlain({ [t.key]: checked })}
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
              variant={chartMode === 'resource' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('resource')}
            >
              Resources
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'depth' ? (
                <AreaChart data={DEPTH_PROFILE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="depth" tick={{ fontSize: 10 }} label={{ value: 'Depth (m)', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="nodules" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Nodule Density (kg/m²)" />
                  <Area type="monotone" dataKey="bio" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Biodiversity Index" />
                </AreaChart>
              ) : (
                <BarChart data={RESOURCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="feature" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Mt', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="manganese" stackId="a" fill="#6b7280" name="Mn" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nickel" stackId="a" fill="#a16207" name="Ni" />
                  <Bar dataKey="copper" stackId="a" fill="#f59e0b" name="Cu" />
                  <Bar dataKey="cobalt" stackId="a" fill="#3b82f6" name="Co" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* Feature List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Abyssal Features ({filteredFeatures.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredFeatures && filteredFeatures.length > 0) ? filteredFeatures.map((feature) => {
                  const sedCfg = SEDIMENT_CONFIG[feature.sedimentType] || { label: feature.sedimentType, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeFeature?.id === feature.id
                  return (
                    <div
                      key={feature.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-teal-500/50 bg-teal-500/5' : 'border-border/50 hover:border-teal-500/30 hover:bg-teal-500/5'
                      }`}
                      onClick={() => setAbyssalPlain({ activeFeatureId: isActive ? null : feature.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{feature.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${sedCfg.bgClass}`}>
                          {sedCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {abyssalPlain.showDepth && <span>{feature.depth} m</span>}
                        {abyssalPlain.showNoduleDensity && <span>{feature.noduleDensity} kg/m²</span>}
                        {abyssalPlain.showBiodiversityIndex && <span>Bio: {feature.biodiversityIndex}</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No features match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Feature Detail + Resource Assessment */}
          {activeFeature && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5 text-teal-500" />
                  {activeFeature.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-teal-600" />
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-medium">{activeFeature.depth} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Anchor className="h-3 w-3 text-stone-500" />
                    <span className="text-muted-foreground">Sediment:</span>
                    <span className="font-medium">{(SEDIMENT_CONFIG[activeFeature.sedimentType] || { label: activeFeature.sedimentType }).label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gem className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">Nodules:</span>
                    <span className="font-medium">{activeFeature.noduleDensity} kg/m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fish className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Bio Index:</span>
                    <span className="font-medium">{activeFeature.biodiversityIndex}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Resource Potential</span>
                    <span className="text-[10px] font-medium">{activeFeature.noduleDensity > 10 ? 'High' : activeFeature.noduleDensity > 5 ? 'Medium' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeFeature.noduleDensity / 16) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeFeature.latitude.toFixed(2)}°, {activeFeature.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
