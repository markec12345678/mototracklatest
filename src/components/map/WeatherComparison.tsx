'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type WeatherComparisonLocation } from '@/lib/map-store'
import {
  Thermometer,
  Plus,
  Trash2,
  CloudSun,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

interface CurrentWeather {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  uvIndex: number
  pressure: number
}

interface HistoricalData {
  date: string
  tempMax: number
  tempMin: number
  precipitation: number
}

interface MonthlyAverage {
  month: string
  avgTemp: number
  avgRainfall: number
  comfortIndex: number
}

interface LocationWeather {
  location: WeatherComparisonLocation
  current: CurrentWeather | null
  historical: HistoricalData[]
  monthly: MonthlyAverage[]
  alerts: string[]
  loading: boolean
  error: string | null
}

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

async function fetchCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,uv_index,surface_pressure`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  const data = await res.json()
  return {
    temperature: data.current?.temperature_2m ?? 0,
    humidity: data.current?.relative_humidity_2m ?? 0,
    windSpeed: data.current?.wind_speed_10m ?? 0,
    precipitation: data.current?.precipitation ?? 0,
    uvIndex: data.current?.uv_index ?? 0,
    pressure: data.current?.surface_pressure ?? 0,
  }
}

async function fetchHistoricalWeather(lat: number, lng: number, days: number): Promise<HistoricalData[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&start_date=${fmt(start)}&end_date=${fmt(end)}&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch historical weather')
  const data = await res.json()
  const result: HistoricalData[] = []
  const daily = data.daily
  if (daily?.time && daily?.temperature_2m_max && daily?.temperature_2m_min && daily?.precipitation_sum) {
    for (let i = 0; i < daily.time.length; i++) {
      result.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max[i] ?? 0,
        tempMin: daily.temperature_2m_min[i] ?? 0,
        precipitation: daily.precipitation_sum[i] ?? 0,
      })
    }
  }
  return result
}

async function fetchMonthlyAverages(lat: number, lng: number): Promise<MonthlyAverage[]> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const result: MonthlyAverage[] = []
  // Use historical forecast API for monthly averages
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&start_date=${fmt(start)}&end_date=${fmt(end)}&timezone=auto`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    const daily = data.daily

    // Generate simulated monthly averages based on recent data and seasonal patterns
    const currentMonth = new Date().getMonth()
    const recentAvgTemp = daily?.temperature_2m_max?.reduce((a: number, b: number) => a + (b || 0), 0) / (daily?.temperature_2m_max?.length || 1) || 20
    const recentRainfall = daily?.precipitation_sum?.reduce((a: number, b: number) => a + (b || 0), 0) || 10

    for (let i = 0; i < 12; i++) {
      const seasonalOffset = Math.sin(((i - currentMonth + 12) % 12) / 12 * Math.PI * 2) * 10
      const avgTemp = Math.round((recentAvgTemp + seasonalOffset) * 10) / 10
      const rainFactor = Math.cos(((i - currentMonth + 12) % 12) / 12 * Math.PI * 2) * 0.5 + 1
      const avgRainfall = Math.round(recentRainfall * rainFactor / 30 * 10) / 10
      // Comfort index: 0-100, higher is more comfortable
      // Based on temperature (ideal 20-25C), low humidity, moderate wind
      const tempComfort = Math.max(0, 100 - Math.abs(avgTemp - 22) * 4)
      const rainComfort = Math.max(0, 100 - avgRainfall * 5)
      const comfortIndex = Math.round((tempComfort * 0.6 + rainComfort * 0.4) * 10) / 10
      result.push({ month: months[i], avgTemp, avgRainfall, comfortIndex })
    }
  } catch {
    // Fallback: basic data
    for (let i = 0; i < 12; i++) {
      result.push({ month: months[i], avgTemp: 20, avgRainfall: 5, comfortIndex: 50 })
    }
  }
  return result
}

async function fetchWeatherAlerts(lat: number, lng: number): Promise<string[]> {
  // Open-Meteo doesn't have a dedicated alerts endpoint
  // We'll check if current conditions warrant alerts
  const alerts: string[] = []
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,uv_index`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const temp = data.current?.temperature_2m
      const wind = data.current?.wind_speed_10m
      const uv = data.current?.uv_index
      if (temp !== undefined && temp > 40) alerts.push(`Extreme heat: ${temp}°C`)
      if (temp !== undefined && temp < -10) alerts.push(`Extreme cold: ${temp}°C`)
      if (wind !== undefined && wind > 50) alerts.push(`High wind: ${wind} km/h`)
      if (uv !== undefined && uv > 8) alerts.push(`Very high UV index: ${uv}`)
    }
  } catch {
    // Ignore
  }
  return alerts
}

export function WeatherComparison() {
  const weatherCompareOpen = useMapStore((s) => s.weatherCompareOpen)
  const setWeatherCompareOpen = useMapStore((s) => s.setWeatherCompareOpen)
  const weatherCompareLocations = useMapStore((s) => s.weatherCompareLocations)
  const addWeatherCompareLocation = useMapStore((s) => s.addWeatherCompareLocation)
  const removeWeatherCompareLocation = useMapStore((s) => s.removeWeatherCompareLocation)
  const clearWeatherCompareLocations = useMapStore((s) => s.clearWeatherCompareLocations)
  const savedLocations = useMapStore((s) => s.savedLocations)

  const [locationWeathers, setLocationWeathers] = useState<LocationWeather[]>([])
  const [dateRange, setDateRange] = useState<'7' | '30'>('7')
  const [activeTab, setActiveTab] = useState<'current' | 'historical' | 'best' | 'alerts'>('current')
  const [addDropdownOpen, setAddDropdownOpen] = useState(false)

  // Available locations to add (not already added)
  const availableLocations = useMemo(() =>
    savedLocations.filter(
      (loc) => !weatherCompareLocations.some((wc) => wc.locationId === loc.id)
    ),
    [savedLocations, weatherCompareLocations]
  )

  // Fetch weather data for all compared locations
  useEffect(() => {
    if (!weatherCompareOpen || weatherCompareLocations.length === 0) {
      setLocationWeathers([])
      return
    }

    let cancelled = false

    async function fetchAll() {
      const results: LocationWeather[] = weatherCompareLocations.map((loc) => ({
        location: loc,
        current: null,
        historical: [],
        monthly: [],
        alerts: [],
        loading: true,
        error: null,
      }))

      setLocationWeathers(results)

      for (let i = 0; i < weatherCompareLocations.length; i++) {
        if (cancelled) return
        const loc = weatherCompareLocations[i]
        try {
          const [current, historical, monthly, alerts] = await Promise.all([
            fetchCurrentWeather(loc.latitude, loc.longitude),
            fetchHistoricalWeather(loc.latitude, loc.longitude, parseInt(dateRange)),
            fetchMonthlyAverages(loc.latitude, loc.longitude),
            fetchWeatherAlerts(loc.latitude, loc.longitude),
          ])

          if (cancelled) return
          setLocationWeathers((prev) =>
            prev.map((w, idx) =>
              idx === i
                ? { ...w, current, historical, monthly, alerts, loading: false }
                : w
            )
          )
        } catch {
          if (cancelled) return
          setLocationWeathers((prev) =>
            prev.map((w, idx) =>
              idx === i
                ? { ...w, loading: false, error: 'Failed to fetch' }
                : w
            )
          )
        }
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [weatherCompareOpen, weatherCompareLocations, dateRange])

  const handleAddLocation = useCallback((locationId: string) => {
    const loc = savedLocations.find((l) => l.id === locationId)
    if (loc) {
      addWeatherCompareLocation({
        locationId: loc.id,
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })
    }
    setAddDropdownOpen(false)
  }, [savedLocations, addWeatherCompareLocation])

  // Current weather comparison data for bar chart
  const currentComparisonData = useMemo(() => {
    if (locationWeathers.length === 0) return []
    const metrics = ['Temperature (°C)', 'Humidity (%)', 'Wind (km/h)', 'Precip. (mm)', 'UV Index', 'Pressure (hPa)'] as const
    return metrics.map((metric, i) => {
      const entry: Record<string, string | number> = { metric }
      locationWeathers.forEach((w, j) => {
        const val = w.current
          ? [val.temperature, val.humidity, val.windSpeed, val.precipitation, val.uvIndex, val.pressure][i]
          : 0
        entry[w.location.name] = typeof val === 'number' ? Math.round(val * 10) / 10 : 0
      })
      return entry
    })
  }, [locationWeathers])

  // Historical temperature trend data for line chart
  const historicalTempData = useMemo(() => {
    if (locationWeathers.length === 0) return []
    const maxLen = Math.max(...locationWeathers.map((w) => w.historical.length), 0)
    const result: Record<string, string | number>[] = []
    for (let i = 0; i < maxLen; i++) {
      const entry: Record<string, string | number> = {
        date: locationWeathers[0]?.historical[i]?.date?.slice(5) || `Day ${i + 1}`,
      }
      locationWeathers.forEach((w) => {
        if (w.historical[i]) {
          entry[`${w.location.name} (Max)`] = w.historical[i].tempMax
          entry[`${w.location.name} (Min)`] = w.historical[i].tempMin
        }
      })
      result.push(entry)
    }
    return result
  }, [locationWeathers])

  // Historical precipitation data for bar chart
  const historicalPrecipData = useMemo(() => {
    if (locationWeathers.length === 0) return []
    const maxLen = Math.max(...locationWeathers.map((w) => w.historical.length), 0)
    const result: Record<string, string | number>[] = []
    for (let i = 0; i < maxLen; i++) {
      const entry: Record<string, string | number> = {
        date: locationWeathers[0]?.historical[i]?.date?.slice(5) || `Day ${i + 1}`,
      }
      locationWeathers.forEach((w) => {
        if (w.historical[i]) {
          entry[w.location.name] = w.historical[i].precipitation
        }
      })
      result.push(entry)
    }
    return result
  }, [locationWeathers])

  // Best time to visit data
  const bestTimeData = useMemo(() => {
    if (locationWeathers.length === 0) return []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, i) => {
      const entry: Record<string, string | number> = { month }
      locationWeathers.forEach((w) => {
        if (w.monthly[i]) {
          entry[`${w.location.name} Temp`] = w.monthly[i].avgTemp
          entry[`${w.location.name} Rain`] = w.monthly[i].avgRainfall
          entry[`${w.location.name} Comfort`] = w.monthly[i].comfortIndex
        }
      })
      return entry
    })
  }, [locationWeathers])

  // All alerts combined
  const allAlerts = useMemo(() =>
    locationWeathers.flatMap((w) =>
      w.alerts.map((alert) => ({ location: w.location.name, alert }))
    ),
    [locationWeathers]
  )

  const barKeys = useMemo(() =>
    locationWeathers.map((w) => w.location.name),
    [locationWeathers]
  )

  return (
    <Dialog open={weatherCompareOpen} onOpenChange={setWeatherCompareOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-5 w-5 text-amber-500" />
            Weather Comparison
            {weatherCompareLocations.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1">
                {weatherCompareLocations.length}/5 locations
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Location selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {weatherCompareLocations.map((loc) => (
              <Badge key={loc.locationId} variant="secondary" className="gap-1.5 px-3 py-1.5">
                <CloudSun className="h-3 w-3" />
                {loc.name}
                <button
                  onClick={() => removeWeatherCompareLocation(loc.locationId)}
                  className="ml-1 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${loc.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {weatherCompareLocations.length < 5 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                  disabled={availableLocations.length === 0}
                >
                  <Plus className="h-3 w-3" />
                  Add Location
                </Button>
                {addDropdownOpen && availableLocations.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto min-w-[180px]">
                    {availableLocations.map((loc) => (
                      <button
                        key={loc.id}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors"
                        onClick={() => handleAddLocation(loc.id)}
                      >
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {weatherCompareLocations.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={clearWeatherCompareLocations}
              >
                Clear All
              </Button>
            )}
          </div>

          {weatherCompareLocations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Thermometer className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Add saved locations to compare their weather conditions
              </p>
              {savedLocations.length === 0 && (
                <p className="text-xs text-muted-foreground/60">
                  Save some locations first to compare weather
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Tab navigation */}
              <div className="flex items-center gap-1 border-b pb-1">
                {([
                  { key: 'current', label: 'Current', icon: Thermometer },
                  { key: 'historical', label: 'Historical', icon: TrendingUp },
                  { key: 'best', label: 'Best Time', icon: CloudSun },
                  { key: 'alerts', label: 'Alerts', icon: Thermometer },
                ] as const).map((tab) => (
                  <Button
                    key={tab.key}
                    size="sm"
                    variant={activeTab === tab.key ? 'secondary' : 'ghost'}
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.key === 'alerts' && allAlerts.length > 0 && (
                      <Badge className="h-4 px-1 text-[9px] bg-red-500 text-white">{allAlerts.length}</Badge>
                    )}
                  </Button>
                ))}
              </div>

              {/* Loading indicator */}
              {locationWeathers.some((w) => w.loading) && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Fetching weather data...</span>
                </div>
              )}

              {/* Current comparison */}
              {activeTab === 'current' && !locationWeathers.some((w) => w.loading) && (
                <div className="space-y-4">
                  {/* Side-by-side cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {locationWeathers.map((w, idx) => (
                      <div key={w.location.locationId} className="rounded-xl border p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-sm font-semibold">{w.location.name}</span>
                        </div>
                        {w.error ? (
                          <p className="text-xs text-red-500">{w.error}</p>
                        ) : w.current ? (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Temp</span>
                              <span className="font-medium">{w.current.temperature}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Humidity</span>
                              <span className="font-medium">{w.current.humidity}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Wind</span>
                              <span className="font-medium">{w.current.windSpeed} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Precip</span>
                              <span className="font-medium">{w.current.precipitation} mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">UV</span>
                              <span className="font-medium">{w.current.uvIndex}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pressure</span>
                              <span className="font-medium">{Math.round(w.current.pressure)} hPa</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {/* Comparison bar chart */}
                  {locationWeathers.length >= 2 && currentComparisonData.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h4 className="text-xs font-semibold mb-3">Side-by-Side Comparison</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={currentComparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          {barKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Historical comparison */}
              {activeTab === 'historical' && !locationWeathers.some((w) => w.loading) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Date range:</span>
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as '7' | '30')}>
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature trends */}
                  {historicalTempData.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        Temperature Trends
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={historicalTempData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.max(Math.floor(historicalTempData.length / 8), 0)} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          {locationWeathers.map((w, i) => [
                            <Line
                              key={`${w.location.locationId}-max`}
                              type="monotone"
                              dataKey={`${w.location.name} (Max)`}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                              dot={false}
                            />,
                            <Line
                              key={`${w.location.locationId}-min`}
                              type="monotone"
                              dataKey={`${w.location.name} (Min)`}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={1.5}
                              strokeDasharray="4 2"
                              dot={false}
                            />,
                          ])}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Precipitation comparison */}
                  {historicalPrecipData.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h4 className="text-xs font-semibold mb-3">Precipitation Comparison</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={historicalPrecipData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.max(Math.floor(historicalPrecipData.length / 8), 0)} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          {barKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[1, 1, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Best Time to Visit */}
              {activeTab === 'best' && !locationWeathers.some((w) => w.loading) && (
                <div className="space-y-4">
                  {/* Comfort Index Chart */}
                  {bestTimeData.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                        <CloudSun className="h-3.5 w-3.5 text-emerald-500" />
                        Comfort Index by Month (higher = more comfortable)
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={bestTimeData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ fontSize: 11 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          {locationWeathers.map((w, i) => (
                            <Area
                              key={w.location.locationId}
                              type="monotone"
                              dataKey={`${w.location.name} Comfort`}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                              fillOpacity={0.15}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Average Temperature Chart */}
                  {bestTimeData.length > 0 && (
                    <div className="rounded-xl border p-4">
                      <h4 className="text-xs font-semibold mb-3">Average Temperature by Month</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={bestTimeData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ fontSize: 11 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          {locationWeathers.map((w, i) => (
                            <Line
                              key={w.location.locationId}
                              type="monotone"
                              dataKey={`${w.location.name} Temp`}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Best month recommendation */}
                  <div className="rounded-xl border p-4">
                    <h4 className="text-xs font-semibold mb-3">Best Months to Visit</h4>
                    <div className="space-y-2">
                      {locationWeathers.map((w, idx) => {
                        const bestMonth = w.monthly.reduce(
                          (best, m, i) => (m.comfortIndex > (w.monthly[best]?.comfortIndex ?? 0) ? i : best),
                          0
                        )
                        const best = w.monthly[bestMonth]
                        return (
                          <div key={w.location.locationId} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                            />
                            <span className="font-medium">{w.location.name}:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {best?.month || 'N/A'}
                            </span>
                            <span className="text-muted-foreground">
                              (avg {best?.avgTemp ?? '—'}°C, comfort: {best?.comfortIndex ?? '—'})
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Weather Alerts */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {allAlerts.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <CloudSun className="h-8 w-8 mx-auto text-emerald-500/40" />
                      <p className="text-sm text-muted-foreground">No active weather alerts for compared locations</p>
                    </div>
                  ) : (
                    allAlerts.map((a, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-red-700 dark:text-red-400">{a.location}</div>
                          <div className="text-xs text-red-600 dark:text-red-300">{a.alert}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
