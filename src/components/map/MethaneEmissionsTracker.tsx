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
import { useMapStore, type MethaneEmissionsState, type MethaneSource } from '@/lib/map-store'
import {
  Factory,
  X,
  TrendingUp,
  Shield,
  Filter,
  MapPin,
} from 'lucide-react'

const DEMO_SOURCES: MethaneSource[] = [
  {
    id: 'me1',
    name: 'Permian Basin',
    latitude: 31.5,
    longitude: -103.0,
    emissionRate: 42.8,
    sourceType: 'energy',
    concentration: 1920,
    trend: 'rising',
    verified: true,
  },
  {
    id: 'me2',
    name: 'Yamal Peninsula',
    latitude: 68.5,
    longitude: 70.5,
    emissionRate: 28.3,
    sourceType: 'natural',
    concentration: 1450,
    trend: 'rising',
    verified: true,
  },
  {
    id: 'me3',
    name: 'Bangladesh Rice',
    latitude: 24.0,
    longitude: 90.0,
    emissionRate: 18.6,
    sourceType: 'agriculture',
    concentration: 980,
    trend: 'stable',
    verified: false,
  },
  {
    id: 'me4',
    name: 'California Dairy',
    latitude: 36.5,
    longitude: -119.5,
    emissionRate: 12.4,
    sourceType: 'agriculture',
    concentration: 720,
    trend: 'falling',
    verified: true,
  },
  {
    id: 'me5',
    name: 'North Sea Leak',
    latitude: 57.0,
    longitude: 2.0,
    emissionRate: 35.1,
    sourceType: 'energy',
    concentration: 1680,
    trend: 'rising',
    verified: true,
  },
  {
    id: 'me6',
    name: 'China Coal',
    latitude: 35.0,
    longitude: 110.0,
    emissionRate: 55.2,
    sourceType: 'industrial',
    concentration: 2340,
    trend: 'rising',
    verified: false,
  },
]

const SOURCE_TYPE_COLORS: Record<MethaneSource['sourceType'], string> = {
  agriculture: '#22c55e',
  energy: '#f97316',
  waste: '#a855f7',
  natural: '#06b6d4',
  industrial: '#ef4444',
}

const SOURCE_TYPE_LABELS: Record<MethaneSource['sourceType'], string> = {
  agriculture: 'Agriculture',
  energy: 'Energy',
  waste: 'Waste',
  natural: 'Natural',
  industrial: 'Industrial',
}

const TREND_COLORS: Record<MethaneSource['trend'], string> = {
  rising: '#ef4444',
  stable: '#eab308',
  falling: '#22c55e',
}

const TREND_LABELS: Record<MethaneSource['trend'], string> = {
  rising: 'Rising',
  stable: 'Stable',
  falling: 'Falling',
}

export function MethaneEmissionsTracker() {
  const methaneEmissions = useMapStore((s) => s.methaneEmissions)
  const setMethaneEmissions = useMapStore((s) => s.setMethaneEmissions)

  const sources = methaneEmissions.methaneSources.length > 0
    ? methaneEmissions.methaneSources
    : DEMO_SOURCES

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (
        methaneEmissions.sourceTypeFilter !== 'all' &&
        s.sourceType !== methaneEmissions.sourceTypeFilter
      )
        return false
      return true
    })
  }, [sources, methaneEmissions.sourceTypeFilter])

  const summary = useMemo(() => {
    const totalEmissions = filteredSources.reduce((sum, s) => sum + s.emissionRate, 0)
    const verifiedCount = filteredSources.filter((s) => s.verified).length
    const risingCount = filteredSources.filter((s) => s.trend === 'rising').length
    return { totalEmissions, verifiedCount, risingCount }
  }, [filteredSources])

  const activeSource = useMemo(() => {
    if (!methaneEmissions.activeSourceId) return null
    return filteredSources.find((s) => s.id === methaneEmissions.activeSourceId) ?? null
  }, [filteredSources, methaneEmissions.activeSourceId])

  if (typeof window === 'undefined') return null
  if (!methaneEmissions.open) return null

  const toggles: {
    key: keyof MethaneEmissionsState
    label: string
  }[] = [
    { key: 'showEmissionRate', label: 'Emission Rate' },
    { key: 'showConcentration', label: 'Concentration' },
    { key: 'showTrend', label: 'Trend' },
    { key: 'showVerified', label: 'Verified' },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Factory className="h-4 w-4 text-orange-500" />
              Methane Emissions Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMethaneEmissions({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-muted/30 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Emissions</div>
              <div className="text-sm font-semibold text-orange-500">
                {summary.totalEmissions.toFixed(1)} t/hr
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Verified</div>
              <div className="text-sm font-semibold text-emerald-600">
                {summary.verifiedCount}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Rising</div>
              <div className="text-sm font-semibold text-red-500">
                {summary.risingCount}
              </div>
            </div>
          </div>

          <Separator />

          {/* Source type filter */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Source Type Filter
            </Label>
            <Select
              value={methaneEmissions.sourceTypeFilter}
              onValueChange={(v) =>
                setMethaneEmissions({
                  sourceTypeFilter: v as MethaneEmissionsState['sourceTypeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="waste">Waste</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Toggle overlays */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {toggles.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs">{label}</span>
                <Switch
                  checked={methaneEmissions[key] as boolean}
                  onCheckedChange={(checked) =>
                    setMethaneEmissions({ [key]: checked })
                  }
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Source list */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = methaneEmissions.activeSourceId === source.id
                  const typeColor = SOURCE_TYPE_COLORS[source.sourceType]
                  const trendColor = TREND_COLORS[source.trend]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setMethaneEmissions({
                          activeSourceId: isActive ? null : source.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {source.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: typeColor,
                              color: typeColor,
                            }}
                          >
                            {SOURCE_TYPE_LABELS[source.sourceType]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {methaneEmissions.showEmissionRate && (
                          <span className="text-[10px] text-muted-foreground">
                            Rate:{' '}
                            <span className="text-foreground font-medium">
                              {source.emissionRate} t/hr
                            </span>
                          </span>
                        )}
                        {methaneEmissions.showConcentration && (
                          <span className="text-[10px] text-muted-foreground">
                            Conc:{' '}
                            <span className="text-foreground font-medium">
                              {source.concentration} ppb
                            </span>
                          </span>
                        )}
                        {methaneEmissions.showTrend && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5"
                            style={{
                              borderColor: trendColor,
                              color: trendColor,
                            }}
                          >
                            <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                            {TREND_LABELS[source.trend]}
                          </Badge>
                        )}
                        {methaneEmissions.showVerified && source.verified && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 border-emerald-500/40 text-emerald-600"
                          >
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Active source details */}
          {activeSource && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  Source Details
                </Label>
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{activeSource.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5"
                      style={{
                        borderColor: SOURCE_TYPE_COLORS[activeSource.sourceType],
                        color: SOURCE_TYPE_COLORS[activeSource.sourceType],
                      }}
                    >
                      {SOURCE_TYPE_LABELS[activeSource.sourceType]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <span className="text-muted-foreground">Emission Rate: </span>
                      <span className="font-medium">{activeSource.emissionRate} t/hr</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Concentration: </span>
                      <span className="font-medium">{activeSource.concentration} ppb</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trend: </span>
                      <span
                        className="font-medium"
                        style={{ color: TREND_COLORS[activeSource.trend] }}
                      >
                        {TREND_LABELS[activeSource.trend]}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verified: </span>
                      <span className="font-medium">
                        {activeSource.verified ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Shield className="h-3 w-3" /> Yes
                          </span>
                        ) : (
                          'No'
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Latitude: </span>
                      <span className="font-medium">{activeSource.latitude.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitude: </span>
                      <span className="font-medium">{activeSource.longitude.toFixed(2)}</span>
                    </div>
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
