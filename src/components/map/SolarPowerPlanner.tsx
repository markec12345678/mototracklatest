'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type SolarSite } from '@/lib/map-store'
import {
  X,
  Sun,
  Zap,
  MapPin,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  Settings,
  Grid3x3,
  Eye,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Demo solar site data
const DEMO_SITES: SolarSite[] = [
  { id: 'ss1', name: 'Sahara Solar Hub', latitude: 27.0, longitude: 5.0, irradiance: 6.5, sunshineHours: 3400, optimalTilt: 22, estimatedYield: 1850, area: 500 },
  { id: 'ss2', name: 'Mojave Site', latitude: 35.0, longitude: -116.0, irradiance: 6.1, sunshineHours: 3100, optimalTilt: 30, estimatedYield: 1620, area: 350 },
  { id: 'ss3', name: 'Atacama Field', latitude: -24.0, longitude: -69.0, irradiance: 7.2, sunshineHours: 3600, optimalTilt: 18, estimatedYield: 2100, area: 420 },
  { id: 'ss4', name: 'Rajasthan Complex', latitude: 26.5, longitude: 73.0, irradiance: 5.9, sunshineHours: 2900, optimalTilt: 24, estimatedYield: 1480, area: 600 },
  { id: 'ss5', name: 'Andalusia Park', latitude: 37.5, longitude: -4.5, irradiance: 5.4, sunshineHours: 2800, optimalTilt: 32, estimatedYield: 1280, area: 250 },
  { id: 'ss6', name: 'Arizona Desert', latitude: 33.5, longitude: -112.0, irradiance: 6.3, sunshineHours: 3200, optimalTilt: 28, estimatedYield: 1720, area: 400 },
]

const PANEL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'monocrystalline', label: 'Mono' },
  { value: 'polycrystalline', label: 'Poly' },
  { value: 'thin_film', label: 'Thin Film' },
  { value: 'bifacial', label: 'Bifacial' },
]

const CALC_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'seasonal', label: 'Seasonal' },
]

// Panel efficiency multipliers for demo purposes
const PANEL_EFFICIENCY: Record<string, number> = {
  monocrystalline: 1.0,
  polycrystalline: 0.85,
  thin_film: 0.72,
  bifacial: 1.15,
}

export function SolarPowerPlanner() {
  const solarPower = useMapStore((s) => s.solarPower)
  const setSolarPower = useMapStore((s) => s.setSolarPower)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // All hooks before early returns
  const sites = solarPower.sites.length > 0 ? solarPower.sites : DEMO_SITES
  const efficiencyMultiplier = PANEL_EFFICIENCY[solarPower.panelType] || 1.0

  const monthlyData = useMemo(() => {
    const baseIrradiance = [4.2, 5.1, 5.8, 6.4, 6.9, 7.2, 7.1, 6.7, 6.1, 5.2, 4.4, 3.9]
    return baseIrradiance.map((irr, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      irradiance: +(irr * efficiencyMultiplier).toFixed(1),
      yield_mwh: +(irr * efficiencyMultiplier * 28).toFixed(0),
    }))
  }, [efficiencyMultiplier])

  const yieldBarData = useMemo(() => {
    return sites
      .map((s) => ({
        name: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name,
        yield: Math.round(s.estimatedYield * efficiencyMultiplier),
        color: s.estimatedYield * efficiencyMultiplier > 1800 ? '#f59e0b' : s.estimatedYield * efficiencyMultiplier > 1400 ? '#eab308' : '#d97706',
      }))
      .sort((a, b) => b.yield - a.yield)
  }, [sites, efficiencyMultiplier])

  const totalCapacity = useMemo(() => {
    return sites.reduce((sum, s) => sum + Math.round(s.estimatedYield * efficiencyMultiplier), 0)
  }, [sites, efficiencyMultiplier])

  const totalArea = useMemo(() => {
    return sites.reduce((sum, s) => sum + s.area, 0)
  }, [sites])

  if (typeof window === 'undefined') return null
  if (!solarPower.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-16 right-4 z-30 w-[380px] max-h-[80vh] overflow-y-auto"
      >
        <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                Solar Power Planner
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {sites.length} sites
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSolarPower({ open: false })}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Summary card */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Total Potential Capacity</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Yield</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalCapacity.toLocaleString()} <span className="text-xs font-normal">MWh/yr</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Area</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalArea.toLocaleString()} <span className="text-xs font-normal">ha</span></p>
                </div>
              </div>
            </div>

            {/* Panel type selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Panel Type</p>
              <div className="flex gap-1">
                {PANEL_TYPE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={solarPower.panelType === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => setSolarPower({ panelType: opt.value as any })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calculation mode selector */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calculation Mode</p>
              <div className="flex gap-1">
                {CALC_MODE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={solarPower.calculationMode === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => setSolarPower({ calculationMode: opt.value as any })}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Overlay toggles */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overlays</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'showIrradiance' as const, label: 'Irradiance', icon: Sun },
                  { key: 'showOptimalZones' as const, label: 'Optimal Zones', icon: TrendingUp },
                  { key: 'showExistingPlants' as const, label: 'Existing Plants', icon: Grid3x3 },
                  { key: 'showGridConnection' as const, label: 'Grid Connection', icon: Zap },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-xs cursor-pointer">{label}</Label>
                    </div>
                    <Switch
                      checked={solarPower[key]}
                      onCheckedChange={(checked) => setSolarPower({ [key]: checked })}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Area chart: monthly solar irradiance/yield */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Irradiance & Yield</p>
              <div className="h-36 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'irradiance') return [`${value} kWh/m²/day`, 'Irradiance']
                        return [`${value} MWh`, 'Yield']
                      }}
                    />
                    <Area type="monotone" dataKey="irradiance" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={1.5} />
                    <Area type="monotone" dataKey="yield_mwh" stroke="#eab308" fill="#eab308" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: estimated yield by site */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated Yield (MWh/yr)</p>
              <div className="h-32 rounded-lg bg-muted/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldBarData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 7 }} angle={-25} textAnchor="end" height={35} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} MWh/yr`, 'Yield']}
                    />
                    <Bar dataKey="yield" radius={[4, 4, 0, 0]}>
                      {yieldBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Site list */}
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5">
                {sites.map((site) => {
                  const adjustedYield = Math.round(site.estimatedYield * efficiencyMultiplier)
                  const isExpanded = expandedId === site.id

                  return (
                    <div
                      key={site.id}
                      className="rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : site.id)}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{site.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {site.irradiance} kWh/m²/day · {adjustedYield} MWh/yr
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] border-0">
                            {site.area} ha
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-1.5">
                              <Separator />
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Sun className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Irradiance:</span>
                                  <span className="font-medium">{site.irradiance} kWh/m²/d</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Sun Hours:</span>
                                  <span className="font-medium">{site.sunshineHours} h/yr</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Opt. Tilt:</span>
                                  <span className="font-medium">{site.optimalTilt}°</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Zap className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Yield:</span>
                                  <span className="font-medium">{adjustedYield} MWh/yr</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Coords:</span>
                                  <span className="font-medium">{site.latitude.toFixed(1)}, {site.longitude.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Area:</span>
                                  <span className="font-medium">{site.area} ha</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
