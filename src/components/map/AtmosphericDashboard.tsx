'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type AtmosphericData } from '@/lib/map-store'
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Cloud,
  Gauge,
  Sun,
  Snowflake,
  RefreshCw,
  Navigation,
  ArrowUp,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32
}

function kmhToMph(k: number): number {
  return k * 0.621371
}

function hpaToInhg(h: number): number {
  return h * 0.02953
}

function kmToMi(k: number): number {
  return k * 0.621371
}

function calcHeatIndex(t: number, rh: number): number | null {
  if (t <= 27 || rh <= 40) return null
  const tf = celsiusToFahrenheit(t)
  let hi = -42.379 + 2.04901523 * tf + 10.14333127 * rh - 0.22475541 * tf * rh - 6.83783e-3 * tf * tf - 5.481717e-2 * rh * rh + 1.22874e-3 * tf * tf * rh + 8.5282e-4 * tf * rh * rh - 1.99e-6 * tf * tf * rh * rh
  return ((hi - 32) * 5) / 9
}

function calcWindChill(t: number, ws: number): number | null {
  if (t >= 10 || ws <= 4.8) return null
  const tf = celsiusToFahrenheit(t)
  const wm = kmhToMph(ws)
  const wc = 35.74 + 0.6215 * tf - 35.75 * Math.pow(wm, 0.16) + 0.4275 * tf * Math.pow(wm, 0.16)
  return ((wc - 32) * 5) / 9
}

function calcFrostPoint(t: number, rh: number): number {
  const a = 17.27
  const b = 237.7
  const gamma = (a * t) / (b + t) + Math.log(rh / 100)
  return (b * gamma) / (a * gamma - 1 + 1e-10) - (b * (gamma - Math.log(rh / 100))) / (a * (gamma - Math.log(rh / 100)) + 1e-10) * 0.5 + t * 0.05
}

function calcAirDensity(t: number, p: number, rh: number): number {
  const tk = t + 273.15
  const pv = (rh / 100) * 610.78 * Math.exp(((17.27 * t) / (t + 237.3)) * Math.log(2.71828))
  const pd = (p - pv) * 100
  const rd = 287.058
  const rv = 461.495
  return pd / (rd * tk) + (pv * 100) / (rv * tk)
}

function getSeverityColor(value: number, type: 'temp' | 'wind' | 'uv'): string {
  if (type === 'temp') {
    if (value > 40 || value < -20) return 'text-red-500'
    if (value > 35 || value < -10) return 'text-orange-500'
    return 'text-foreground'
  }
  if (type === 'wind') {
    if (value > 80) return 'text-red-500'
    if (value > 50) return 'text-orange-500'
    return 'text-foreground'
  }
  if (type === 'uv') {
    if (value >= 11) return 'text-red-500'
    if (value >= 8) return 'text-orange-500'
    if (value >= 6) return 'text-yellow-500'
    return 'text-foreground'
  }
  return 'text-foreground'
}

export function AtmosphericDashboard() {
  const atmospheric = useMapStore((s) => s.atmospheric)
  const setAtmospheric = useMapStore((s) => s.setAtmospheric)
  const center = useMapStore((s) => s.center)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (typeof window === 'undefined') return
    const [lng, lat] = center
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,cloud_cover,precipitation,dew_point_2m,uv_index`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch atmospheric data')
      const json = await res.json()
      const c = json.current || {}
      const temp = c.temperature_2m ?? null
      const rh = c.relative_humidity_2m ?? null
      const pres = c.surface_pressure ?? null
      const ws = c.wind_speed_10m ?? null
      const wd = c.wind_direction_10m ?? null

      const newData: AtmosphericData = {
        temperature: temp,
        humidity: rh,
        pressure: pres,
        windSpeed: ws,
        windDirection: wd,
        windGust: c.wind_gusts_10m ?? null,
        visibility: c.visibility ?? null,
        cloudCover: c.cloud_cover ?? null,
        precipitation: c.precipitation ?? null,
        dewPoint: c.dew_point_2m ?? null,
        frostPoint: temp !== null && rh !== null ? calcFrostPoint(temp, rh) : null,
        heatIndex: temp !== null && rh !== null ? calcHeatIndex(temp, rh) : null,
        windChill: temp !== null && ws !== null ? calcWindChill(temp, ws) : null,
        uvIndex: c.uv_index ?? null,
        airDensity: temp !== null && pres !== null && rh !== null ? calcAirDensity(temp, pres, rh) : null,
        lastUpdated: Date.now(),
      }

      setAtmospheric({
        data: newData,
        historyData: [
          ...(atmospheric.historyData || []).slice(-19),
          {
            time: Date.now(),
            temperature: newData.temperature,
            humidity: newData.humidity,
            pressure: newData.pressure,
          },
        ],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [center, atmospheric.historyData, setAtmospheric])

  useEffect(() => {
    if (!atmospheric.open) return
    fetchData()
    refreshTimerRef.current = setInterval(fetchData, 600000)
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [atmospheric.open, fetchData])

  const d = atmospheric.data
  const isImperial = atmospheric.unitSystem === 'imperial'

  const fmtTemp = (v: number | null) => {
    if (v === null) return '—'
    return isImperial ? `${celsiusToFahrenheit(v).toFixed(1)}°F` : `${v.toFixed(1)}°C`
  }
  const fmtSpeed = (v: number | null) => {
    if (v === null) return '—'
    return isImperial ? `${kmhToMph(v).toFixed(1)} mph` : `${v.toFixed(1)} km/h`
  }
  const fmtPressure = (v: number | null) => {
    if (v === null) return '—'
    return isImperial ? `${hpaToInhg(v).toFixed(2)} inHg` : `${v.toFixed(1)} hPa`
  }
  const fmtDist = (v: number | null) => {
    if (v === null) return '—'
    return isImperial ? `${kmToMi(v).toFixed(1)} mi` : `${v.toFixed(1)} km`
  }

  const windDir = d.windDirection ?? 0

  const historyChartData = (atmospheric.historyData || []).map((h) => ({
    time: new Date(h.time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    temperature: h.temperature,
    humidity: h.humidity,
    pressure: h.pressure ? h.pressure / 10 : null,
  }))

  return (
    <Dialog open={atmospheric.open} onOpenChange={(open) => setAtmospheric({ open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-white" />
            </div>
            Atmospheric Dashboard
            {d.lastUpdated && (
              <Badge variant="outline" className="text-[10px] ml-auto font-normal">
                Updated {new Date(d.lastUpdated).toLocaleTimeString()}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="current" className="flex-1">Current</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              <TabsTrigger value="overlays" className="flex-1">Overlays</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <TabsContent value="current" className="p-4 pt-2 space-y-3">
              {loading && !d.lastUpdated && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading atmospheric data...</span>
                </div>
              )}

              {error && (
                <Card className="border-red-200 dark:border-red-900">
                  <CardContent className="p-3 text-sm text-red-600 dark:text-red-400">
                    Failed to load data: {error}
                  </CardContent>
                </Card>
              )}

              {d.lastUpdated && (
                <>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {isImperial ? 'Imperial' : 'Metric'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setAtmospheric({ unitSystem: isImperial ? 'metric' : 'imperial' })}
                    >
                      <ArrowUp className="h-3 w-3" />
                      Switch to {isImperial ? 'Metric' : 'Imperial'}
                    </Button>
                  </div>

                  {/* Main metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <MetricCard icon={Thermometer} label="Temperature" value={fmtTemp(d.temperature)} colorClass={getSeverityColor(d.temperature ?? 0, 'temp')} gradient="from-sky-500/10 to-blue-500/10" />
                    <MetricCard icon={Droplets} label="Humidity" value={d.humidity !== null ? `${d.humidity.toFixed(0)}%` : '—'} gradient="from-sky-500/10 to-cyan-500/10" />
                    <MetricCard icon={Gauge} label="Pressure" value={fmtPressure(d.pressure)} gradient="from-blue-500/10 to-indigo-500/10" />
                    <MetricCard icon={Wind} label="Wind Speed" value={fmtSpeed(d.windSpeed)} colorClass={getSeverityColor(d.windSpeed ?? 0, 'wind')} gradient="from-sky-500/10 to-teal-500/10" />
                    <MetricCard icon={Wind} label="Wind Gust" value={fmtSpeed(d.windGust)} gradient="from-teal-500/10 to-cyan-500/10" />
                    <MetricCard icon={Eye} label="Visibility" value={fmtDist(d.visibility)} gradient="from-sky-500/10 to-blue-500/10" />
                    <MetricCard icon={Cloud} label="Cloud Cover" value={d.cloudCover !== null ? `${d.cloudCover.toFixed(0)}%` : '—'} gradient="from-gray-500/10 to-sky-500/10" />
                    <MetricCard icon={Cloud} label="Precipitation" value={d.precipitation !== null ? `${d.precipitation.toFixed(1)} mm` : '—'} gradient="from-blue-500/10 to-sky-500/10" />
                    <MetricCard icon={Droplets} label="Dew Point" value={fmtTemp(d.dewPoint)} gradient="from-cyan-500/10 to-sky-500/10" />
                    <MetricCard icon={Snowflake} label="Frost Point" value={fmtTemp(d.frostPoint)} gradient="from-sky-500/10 to-blue-500/10" />
                    <MetricCard icon={Sun} label="UV Index" value={d.uvIndex !== null ? d.uvIndex.toFixed(1) : '—'} colorClass={getSeverityColor(d.uvIndex ?? 0, 'uv')} gradient="from-yellow-500/10 to-orange-500/10" />
                    <MetricCard icon={Thermometer} label="Air Density" value={d.airDensity !== null ? `${d.airDensity.toFixed(3)} kg/m³` : '—'} gradient="from-sky-500/10 to-blue-500/10" />
                  </div>

                  {/* Derived metrics */}
                  {(d.heatIndex !== null || d.windChill !== null) && (
                    <div className="grid grid-cols-2 gap-2">
                      {d.heatIndex !== null && (
                        <Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-500/5 to-red-500/5">
                          <CardContent className="p-3 flex items-center gap-2">
                            <Sun className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase">Heat Index</p>
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{fmtTemp(d.heatIndex)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {d.windChill !== null && (
                        <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                          <CardContent className="p-3 flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase">Wind Chill</p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{fmtTemp(d.windChill)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Wind direction compass */}
                  <Card className="bg-gradient-to-br from-sky-500/5 to-blue-500/5">
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-full border-2 border-sky-300 dark:border-sky-700 flex items-center justify-center shrink-0">
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-sky-500">N</span>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-muted-foreground">S</span>
                        <span className="absolute top-1/2 -left-1 -translate-y-1/2 text-[8px] font-bold text-muted-foreground">W</span>
                        <span className="absolute top-1/2 -right-1 -translate-y-1/2 text-[8px] font-bold text-muted-foreground">E</span>
                        <Navigation
                          className="h-6 w-6 text-sky-500 transition-transform duration-500"
                          style={{ transform: `rotate(${windDir}deg)` }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.windDirection !== null ? `${d.windDirection.toFixed(0)}°` : '—'}</p>
                        <p className="text-xs text-muted-foreground">Wind Direction</p>
                        {d.windSpeed !== null && (
                          <p className="text-xs text-muted-foreground mt-1">{fmtSpeed(d.windSpeed)}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={fetchData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-4 pt-2">
              {historyChartData.length > 1 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Atmospheric History</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={historyChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Temp (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Humidity (%)" />
                        <Line type="monotone" dataKey="pressure" stroke="#6366f1" strokeWidth={2} dot={false} name="Pressure (hPa/10)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Cloud className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Collecting history data...</p>
                  <p className="text-xs mt-1">More readings will appear over time</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overlays" className="p-4 pt-2 space-y-3">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Map Overlay Toggles</p>
                  <OverlayToggle label="Wind Barbs" checked={atmospheric.showWindBarb} onCheckedChange={(v) => setAtmospheric({ showWindBarb: v })} icon={Wind} />
                  <OverlayToggle label="Pressure Isobars" checked={atmospheric.showPressureIsobars} onCheckedChange={(v) => setAtmospheric({ showPressureIsobars: v })} icon={Gauge} />
                  <OverlayToggle label="Cloud Cover" checked={atmospheric.showCloudCover} onCheckedChange={(v) => setAtmospheric({ showCloudCover: v })} icon={Cloud} />
                  <OverlayToggle label="Temperature Gradient" checked={atmospheric.showTemperatureGradient} onCheckedChange={(v) => setAtmospheric({ showTemperatureGradient: v })} icon={Thermometer} />
                </CardContent>
              </Card>

              <Separator />

              <div className="flex items-center justify-between">
                <Label className="text-sm">Unit System</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">°C</span>
                  <Switch
                    checked={isImperial}
                    onCheckedChange={(v) => setAtmospheric({ unitSystem: v ? 'imperial' : 'metric' })}
                    aria-label="Toggle unit system"
                  />
                  <span className="text-xs text-muted-foreground">°F</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/60 text-center pt-2">
                Data from Open-Meteo API · Auto-refresh every 10 minutes
              </p>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  colorClass = 'text-foreground',
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  colorClass?: string
  gradient: string
}) {
  return (
    <Card className={`bg-gradient-to-br ${gradient}`}>
      <CardContent className="p-2.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground uppercase truncate">{label}</p>
          <p className={`text-sm font-semibold tabular-nums truncate ${colorClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function OverlayToggle({
  label,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-500" />
        <Label className="text-sm cursor-pointer">{label}</Label>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={`Toggle ${label}`} />
    </div>
  )
}
