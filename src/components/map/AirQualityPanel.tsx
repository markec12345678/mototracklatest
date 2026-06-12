'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/lib/map-store'
import {
  Wind,
  CloudSun,
  X,
  Loader2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Droplets,
  Flame,
  Cloud,
  ShieldAlert,
} from 'lucide-react'

interface AQICurrent {
  pm2_5: number
  pm10: number
  us_aqi: number
  carbon_monoxide: number
  nitrogen_dioxide: number
  sulphur_dioxide: number
  ozone: number
}

interface AQIHourly {
  time: string[]
  pm2_5: number[]
  pm10: number[]
  us_aqi: number[]
  carbon_monoxide: number[]
  nitrogen_dioxide: number[]
  sulphur_dioxide: number[]
  ozone: number[]
}

interface AQIData {
  current: AQICurrent | null
  hourly: AQIHourly | null
  latitude: number
  longitude: number
}

function getAQICategory(aqi: number): { label: string; color: string; bgColor: string; textColor: string } {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e', bgColor: 'bg-green-500/10', textColor: 'text-green-600 dark:text-green-400' }
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#f97316', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bgColor: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' }
  return { label: 'Hazardous', color: '#7f1d1d', bgColor: 'bg-rose-900/10', textColor: 'text-rose-700 dark:text-rose-400' }
}

function getPollutantLevel(value: number, thresholds: number[]): { percent: number; color: string } {
  // thresholds: [good_max, moderate_max, unhealthy_sensitive_max, unhealthy_max, very_unhealthy_max]
  if (value <= thresholds[0]) return { percent: Math.min((value / thresholds[0]) * 25, 25), color: 'bg-green-500' }
  if (value <= thresholds[1]) return { percent: 25 + Math.min(((value - thresholds[0]) / (thresholds[1] - thresholds[0])) * 25, 25), color: 'bg-yellow-500' }
  if (value <= thresholds[2]) return { percent: 50 + Math.min(((value - thresholds[1]) / (thresholds[2] - thresholds[1])) * 25, 25), color: 'bg-orange-500' }
  if (value <= thresholds[3]) return { percent: 75 + Math.min(((value - thresholds[2]) / (thresholds[3] - thresholds[2])) * 25, 25), color: 'bg-red-500' }
  return { percent: 100, color: 'bg-purple-500' }
}

const POLLUTANT_CONFIG = [
  {
    key: 'pm2_5' as const,
    label: 'PM2.5',
    unit: 'µg/m³',
    icon: Droplets,
    thresholds: [12, 35.4, 55.4, 150.4, 250.4],
    description: 'Fine particulate matter',
  },
  {
    key: 'pm10' as const,
    label: 'PM10',
    unit: 'µg/m³',
    icon: Cloud,
    thresholds: [54, 154, 254, 354, 424],
    description: 'Coarse particulate matter',
  },
  {
    key: 'carbon_monoxide' as const,
    label: 'CO',
    unit: 'µg/m³',
    icon: Flame,
    thresholds: [4400, 9400, 12400, 15400, 30400],
    description: 'Carbon monoxide',
  },
  {
    key: 'nitrogen_dioxide' as const,
    label: 'NO₂',
    unit: 'µg/m³',
    icon: ShieldAlert,
    thresholds: [53, 100, 360, 649, 1249],
    description: 'Nitrogen dioxide',
  },
  {
    key: 'sulphur_dioxide' as const,
    label: 'SO₂',
    unit: 'µg/m³',
    icon: CloudSun,
    thresholds: [35, 75, 185, 304, 604],
    description: 'Sulphur dioxide',
  },
  {
    key: 'ozone' as const,
    label: 'O₃',
    unit: 'µg/m³',
    icon: Wind,
    thresholds: [54, 124, 164, 204, 404],
    description: 'Ozone',
  },
]

export function AirQualityPanel() {
  const aqiPanelOpen = useMapStore((s) => s.aqiPanelOpen)
  const setAqiPanelOpen = useMapStore((s) => s.setAqiPanelOpen)
  const center = useMapStore((s) => s.center)

  const [aqiData, setAqiData] = useState<AQIData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchCenter = useRef<[number, number] | null>(null)

  const fetchAQI = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/air-quality?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`)
      if (!res.ok) {
        throw new Error('Failed to fetch air quality data')
      }
      const data: AQIData = await res.json()
      setAqiData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch when panel opens or center changes significantly
  useEffect(() => {
    if (!aqiPanelOpen) return
    const [lng, lat] = center
    const lastCenter = lastFetchCenter.current

    // Only fetch if center changed significantly (>0.05 degrees) or first time
    if (!lastCenter || Math.abs(lat - lastCenter[1]) > 0.05 || Math.abs(lng - lastCenter[0]) > 0.05) {
      lastFetchCenter.current = [lng, lat]
      fetchAQI(lat, lng)
    }
  }, [aqiPanelOpen, center, fetchAQI])

  // Prepare hourly forecast data for chart
  const hourlyChartData = (() => {
    if (!aqiData?.hourly) return []
    const { time, us_aqi } = aqiData.hourly
    const now = new Date()
    const data = []
    for (let i = 0; i < time.length; i++) {
      const t = new Date(time[i])
      if (t >= now) {
        data.push({
          hour: t.toLocaleTimeString('en', { hour: 'numeric', hour12: true }),
          aqi: us_aqi[i] ?? 0,
          color: getAQICategory(us_aqi[i] ?? 0).color,
        })
        if (data.length >= 24) break
      }
    }
    return data
  })()

  const currentAQI = aqiData?.current?.us_aqi
  const category = currentAQI !== undefined && currentAQI !== null
    ? getAQICategory(currentAQI)
    : null

  return (
    <Sheet open={aqiPanelOpen} onOpenChange={setAqiPanelOpen}>
      <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-emerald-500" />
            Air Quality Index
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-muted-foreground mt-3">Loading air quality data...</p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load data</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && aqiData?.current && (
            <>
              {/* Main AQI Display */}
              <Card className="border-border/50 overflow-hidden">
                <div
                  className="h-2"
                  style={{
                    background: category
                      ? `linear-gradient(to right, ${category.color}33, ${category.color})`
                      : undefined,
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        US AQI
                      </p>
                      <p className="text-5xl font-bold tabular-nums" style={{ color: category?.color }}>
                        {currentAQI?.toFixed(0) ?? '—'}
                      </p>
                    </div>
                    {category && (
                      <Badge
                        className={`${category.bgColor} ${category.textColor} border-0 px-3 py-1 text-xs font-medium`}
                      >
                        {category.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Location: {aqiData.latitude.toFixed(2)}°, {aqiData.longitude.toFixed(2)}°
                  </p>
                </CardContent>
              </Card>

              {/* AQI Scale Reference */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    AQI Scale
                  </h4>
                  <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
                    <div className="flex-1 bg-green-500" title="0-50: Good" />
                    <div className="flex-1 bg-yellow-500" title="51-100: Moderate" />
                    <div className="flex-1 bg-orange-500" title="101-150: Unhealthy for Sensitive" />
                    <div className="flex-1 bg-red-500" title="151-200: Unhealthy" />
                    <div className="flex-1 bg-purple-500" title="201-300: Very Unhealthy" />
                    <div className="flex-1 bg-rose-900" title="301+: Hazardous" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-muted-foreground">0</span>
                    <span className="text-[8px] text-muted-foreground">50</span>
                    <span className="text-[8px] text-muted-foreground">100</span>
                    <span className="text-[8px] text-muted-foreground">150</span>
                    <span className="text-[8px] text-muted-foreground">200</span>
                    <span className="text-[8px] text-muted-foreground">300</span>
                    <span className="text-[8px] text-muted-foreground">500</span>
                  </div>
                  {currentAQI !== null && currentAQI !== undefined && (
                    <div className="relative mt-1">
                      <div
                        className="absolute -translate-x-1/2 transition-all duration-500"
                        style={{ left: `${Math.min((currentAQI / 500) * 100, 100)}%` }}
                      >
                        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Pollutant Levels */}
              <Card className="border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Pollutant Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {POLLUTANT_CONFIG.map((pollutant) => {
                    const value = aqiData.current?.[pollutant.key]
                    if (value === undefined || value === null) return null
                    const level = getPollutantLevel(value, pollutant.thresholds)
                    const Icon = pollutant.icon
                    return (
                      <div key={pollutant.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{pollutant.label}</span>
                            <span className="text-[9px] text-muted-foreground">({pollutant.description})</span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">
                            {value.toFixed(1)} <span className="text-[9px] text-muted-foreground font-normal">{pollutant.unit}</span>
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${level.color}`}
                            style={{ width: `${level.percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Separator />

              {/* 24-Hour AQI Forecast */}
              {hourlyChartData.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      24-Hour AQI Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={hourlyChartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <XAxis
                          dataKey="hour"
                          tick={{ fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          interval={2}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(0)}`, 'AQI']}
                        />
                        <Bar dataKey="aqi" radius={[3, 3, 0, 0]}>
                          {hourlyChartData.map((entry, index) => (
                            <Cell key={`aqi-cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Health Recommendations */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Health Recommendations
                  </h4>
                  {currentAQI !== null && currentAQI !== undefined ? (
                    <div className="space-y-2">
                      {currentAQI <= 50 && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Air quality is good. Enjoy outdoor activities!
                        </p>
                      )}
                      {currentAQI > 50 && currentAQI <= 100 && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.
                        </p>
                      )}
                      {currentAQI > 100 && currentAQI <= 150 && (
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Sensitive groups may experience health effects. General public is less likely to be affected.
                        </p>
                      )}
                      {currentAQI > 150 && currentAQI <= 200 && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.
                        </p>
                      )}
                      {currentAQI > 200 && currentAQI <= 300 && (
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Health alert: everyone may experience more serious health effects. Avoid outdoor activities.
                        </p>
                      )}
                      {currentAQI > 300 && (
                        <p className="text-sm text-rose-700 dark:text-rose-400">
                          Health warning of emergency conditions. Everyone is likely to be affected. Stay indoors.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!loading && !error && !aqiData?.current && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wind className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">No air quality data available</p>
              <p className="text-xs mt-1">Try moving the map to a different location</p>
            </div>
          )}

          {/* Data Source Attribution */}
          <div className="text-center py-2">
            <p className="text-[10px] text-muted-foreground/60">
              Data from Open-Meteo Air Quality API · Updated every 10 minutes
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
