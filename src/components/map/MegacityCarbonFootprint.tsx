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
import { useMapStore, type MegacityEmission, type MegacityCarbonState } from '@/lib/map-store'
import { Globe as GlobeIcon3, Building2, TrendingUp, Zap, X, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const DEMO_CITIES: MegacityEmission[] = [
  {
    id: 'mc-tokyo',
    name: 'Tokyo',
    population: 37.4,
    co2Emissions: 78.5,
    methaneEmissions: 2450,
    transportShare: 32,
    energyShare: 38,
    industrialShare: 30,
    latitude: 35.68,
    longitude: 139.69,
  },
  {
    id: 'mc-shanghai',
    name: 'Shanghai',
    population: 28.5,
    co2Emissions: 152.3,
    methaneEmissions: 3820,
    transportShare: 22,
    energyShare: 45,
    industrialShare: 33,
    latitude: 31.23,
    longitude: 121.47,
  },
  {
    id: 'mc-delhi',
    name: 'Delhi',
    population: 32.9,
    co2Emissions: 68.7,
    methaneEmissions: 5100,
    transportShare: 28,
    energyShare: 35,
    industrialShare: 37,
    latitude: 28.61,
    longitude: 77.21,
  },
  {
    id: 'mc-saopaulo',
    name: 'São Paulo',
    population: 22.4,
    co2Emissions: 42.1,
    methaneEmissions: 1890,
    transportShare: 45,
    energyShare: 25,
    industrialShare: 30,
    latitude: -23.55,
    longitude: -46.63,
  },
  {
    id: 'mc-lagos',
    name: 'Lagos',
    population: 16.0,
    co2Emissions: 28.5,
    methaneEmissions: 3200,
    transportShare: 35,
    energyShare: 28,
    industrialShare: 37,
    latitude: 6.52,
    longitude: 3.38,
  },
]

const EMISSION_CONFIG: Record<string, { label: string; bgClass: string }> = {
  low: { label: 'Low', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  'very-high': { label: 'Very High', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6']

const EMISSION_COMPARISON_DATA = DEMO_CITIES.map((c) => ({
  name: c.name,
  co2: c.co2Emissions,
  methane: Math.round(c.methaneEmissions / 100),
}))

function getEmissionLevel(co2: number): string {
  if (co2 < 50) return 'low'
  if (co2 < 100) return 'moderate'
  if (co2 < 200) return 'high'
  return 'very-high'
}

export function MegacityCarbonFootprint() {
  const megacityCarbon = useMapStore((s) => s.megacityCarbon)
  const setMegacityCarbon = useMapStore((s) => s.setMegacityCarbon)

  const [chartMode, setChartMode] = useState<'emission' | 'sector'>('emission')

  const cities = useMemo(
    () => (megacityCarbon.cities && megacityCarbon.cities.length > 0 ? megacityCarbon.cities : DEMO_CITIES),
    [megacityCarbon.cities]
  )

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      if (megacityCarbon.emissionFilter !== 'all') {
        const level = getEmissionLevel(c.co2Emissions)
        if (level !== megacityCarbon.emissionFilter) return false
      }
      return true
    })
  }, [cities, megacityCarbon.emissionFilter])

  const summary = useMemo(() => {
    if (!filteredCities || filteredCities.length === 0) {
      return { totalCO2: 0, avgPerCapita: 0, topEmitter: 'N/A' }
    }
    const totalCO2 = Math.round(filteredCities.reduce((s, c) => s + c.co2Emissions, 0) * 10) / 10
    const totalPop = filteredCities.reduce((s, c) => s + c.population, 0)
    const avgPerCapita = Math.round((totalCO2 / totalPop) * 100) / 100
    const topEmitter = filteredCities.reduce((max, c) => c.co2Emissions > max.co2Emissions ? c : max, filteredCities[0]).name
    return { totalCO2, avgPerCapita, topEmitter }
  }, [filteredCities])

  const activeCity = useMemo(
    () => (cities && cities.length > 0 ? cities.find((c) => c.id === megacityCarbon.activeCityId) ?? null : null),
    [cities, megacityCarbon.activeCityId]
  )

  const sectorData = useMemo(() => {
    if (!activeCity) return []
    return [
      { name: 'Transport', value: activeCity.transportShare },
      { name: 'Energy', value: activeCity.energyShare },
      { name: 'Industrial', value: activeCity.industrialShare },
    ]
  }, [activeCity])

  if (typeof window === 'undefined') return null
  if (!megacityCarbon.open) return null

  const overlayToggles: { key: keyof MegacityCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCO2', label: 'CO₂', icon: Zap },
    { key: 'showMethane', label: 'Methane', icon: TrendingUp },
    { key: 'showTransportShare', label: 'Transport', icon: Building2 },
    { key: 'showEnergyShare', label: 'Energy', icon: Zap },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <GlobeIcon3 className="h-4 w-4 text-emerald-500" />
              Megacity Carbon Footprint
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMegacityCarbon({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Emission Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Emission Level
            </Label>
            <Select
              value={megacityCarbon.emissionFilter}
              onValueChange={(v) =>
                setMegacityCarbon({
                  emissionFilter: v as MegacityCarbonState['emissionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low (0–50 Mt)</SelectItem>
                <SelectItem value="moderate">Moderate (50–100 Mt)</SelectItem>
                <SelectItem value="high">High (100–200 Mt)</SelectItem>
                <SelectItem value="very-high">Very High (200+ Mt)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Total CO₂</div>
              <div className="text-sm font-semibold">{summary.totalCO2} Mt</div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Avg Per Capita</div>
              <div className="text-sm font-semibold">{summary.avgPerCapita} t</div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <div className="text-[10px] text-muted-foreground">Top Emitter</div>
              <div className="text-sm font-semibold truncate">{summary.topEmitter}</div>
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
                    checked={megacityCarbon[t.key] as boolean}
                    onCheckedChange={(checked) => setMegacityCarbon({ [t.key]: checked })}
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
              variant={chartMode === 'emission' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('emission')}
            >
              Emission Comparison
            </Button>
            <Button
              variant={chartMode === 'sector' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 flex-1"
              onClick={() => setChartMode('sector')}
            >
              Sector Breakdown
            </Button>
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'emission' ? (
                <BarChart data={EMISSION_COMPARISON_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: 'Mt/yr', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="co2" fill="#10b981" name="CO₂ (Mt/yr)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {sectorData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <Separator />

          {/* City List */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Megacities ({filteredCities.length})
            </Label>
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                {(filteredCities && filteredCities.length > 0) ? filteredCities.map((city) => {
                  const level = getEmissionLevel(city.co2Emissions)
                  const emitCfg = EMISSION_CONFIG[level] || { label: level, bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
                  const isActive = activeCity?.id === city.id
                  return (
                    <div
                      key={city.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        isActive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      }`}
                      onClick={() => setMegacityCarbon({ activeCityId: isActive ? null : city.id })}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{city.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${emitCfg.bgClass}`}>
                          {emitCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {megacityCarbon.showCO2 && <span>{city.co2Emissions} Mt CO₂</span>}
                        {megacityCarbon.showMethane && <span>{city.methaneEmissions} kt CH₄</span>}
                        {megacityCarbon.showTransportShare && <span>Transport: {city.transportShare}%</span>}
                        {megacityCarbon.showEnergyShare && <span>Energy: {city.energyShare}%</span>}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-xs text-muted-foreground text-center py-4">No cities match current filter</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active City Detail */}
          {activeCity && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <GlobeIcon3 className="h-3.5 w-3.5 text-emerald-500" />
                  {activeCity.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-muted-foreground">Pop:</span>
                    <span className="font-medium">{activeCity.population}M</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">CO₂:</span>
                    <span className="font-medium">{activeCity.co2Emissions} Mt/yr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-500" />
                    <span className="text-muted-foreground">CH₄:</span>
                    <span className="font-medium">{activeCity.methaneEmissions} kt/yr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Industrial:</span>
                    <span className="font-medium">{activeCity.industrialShare}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Emission Intensity</span>
                    <span className="text-[10px] font-medium">{activeCity.co2Emissions > 100 ? 'Very High' : activeCity.co2Emissions > 50 ? 'High' : activeCity.co2Emissions > 30 ? 'Moderate' : 'Low'}</span>
                  </div>
                  <Progress value={Math.min(100, (activeCity.co2Emissions / 200) * 100)} className="h-1.5" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Location: {activeCity.latitude.toFixed(2)}°, {activeCity.longitude.toFixed(2)}°
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
