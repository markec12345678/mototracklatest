'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type WeatherData } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  AlertTriangle,
  Eye,
  Gauge,
  CloudRain,
  RefreshCw,
  MapPin,
  Sunrise,
  Sunset,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DailyForecast {
  date: string
  dayName: string
  tempMax: number
  tempMin: number
  weatherCode: number
  precipProb: number
  windSpeed: number
}

interface HourlyForecast {
  time: string
  hour: string
  temperature: number
  windSpeed: number
  precip: number
  weatherCode: number
}

interface WeatherAlert {
  type: 'severe' | 'frost' | 'heat' | 'storm'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

interface AirQualityData {
  aqi: number
  category: string
  pm25: number
  pm10: number
  o3: number
  no2: number
  recommendation: string
}

interface SunMoonData {
  sunrise: string
  sunset: string
  moonPhase: string
  moonPhaseEmoji: string
  daylightHours: number
}

// WMO Weather interpretation codes
function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 59) return '🌧️'
  if (code <= 69) return '🌨️'
  if (code <= 79) return '❄️'
  if (code <= 84) return '🌧️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return descriptions[code] || 'Unknown'
}

function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round(degrees / 45) % 8
  return dirs[idx]
}

function getMoonPhaseEmoji(phase: number): string {
  if (phase < 0.0625) return '🌑'
  if (phase < 0.1875) return '🌒'
  if (phase < 0.3125) return '🌓'
  if (phase < 0.4375) return '🌔'
  if (phase < 0.5625) return '🌕'
  if (phase < 0.6875) return '🌖'
  if (phase < 0.8125) return '🌗'
  if (phase < 0.9375) return '🌘'
  return '🌑'
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625) return 'New Moon'
  if (phase < 0.1875) return 'Waxing Crescent'
  if (phase < 0.3125) return 'First Quarter'
  if (phase < 0.4375) return 'Waxing Gibbous'
  if (phase < 0.5625) return 'Full Moon'
  if (phase < 0.6875) return 'Waning Gibbous'
  if (phase < 0.8125) return 'Last Quarter'
  if (phase < 0.9375) return 'Waning Crescent'
  return 'New Moon'
}

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'text-emerald-600'
  if (aqi <= 100) return 'text-yellow-600'
  if (aqi <= 150) return 'text-orange-600'
  if (aqi <= 200) return 'text-red-600'
  if (aqi <= 300) return 'text-purple-600'
  return 'text-rose-900'
}

function getUvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-600' }
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-600' }
  if (uv <= 7) return { label: 'High', color: 'text-orange-600' }
  if (uv <= 10) return { label: 'Very High', color: 'text-red-600' }
  return { label: 'Extreme', color: 'text-purple-600' }
}

export function EnhancedWeatherDashboard() {
  const enhancedWeatherOpen = useMapStore((s) => s.enhancedWeatherOpen)
  const setEnhancedWeatherOpen = useMapStore((s) => s.setEnhancedWeatherOpen)
  const enhancedWeather = useMapStore((s) => s.enhancedWeather)
  const setEnhancedWeather = useMapStore((s) => s.setEnhancedWeather)
  const temperatureUnit = useMapStore((s) => s.temperatureUnit)
  const setTemperatureUnit = useMapStore((s) => s.setTemperatureUnit)
  const center = useMapStore((s) => s.center)

  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([])
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
  const [sunMoon, setSunMoon] = useState<SunMoonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('current')

  const fetchedOnce = useRef(false)

  const convertTemp = useCallback(
    (celsius: number) => {
      if (temperatureUnit === 'fahrenheit') return Math.round(celsius * 9 / 5 + 32)
      return Math.round(celsius)
    },
    [temperatureUnit]
  )

  const tempUnit = temperatureUnit === 'celsius' ? '°C' : '°F'

  // Fetch weather data from Open-Meteo
  const fetchWeatherData = useCallback(async () => {
    const lat = center[1]
    const lon = center[0]
    setIsLoading(true)

    try {
      // Current weather + hourly + daily
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,cloud_cover,uv_index&hourly=temperature_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7`
      )
      const weatherData = await weatherRes.json()

      if (weatherData.current) {
        const c = weatherData.current
        setEnhancedWeather({
          temperature: c.temperature_2m,
          feelsLike: c.apparent_temperature,
          humidity: c.relative_humidity_2m,
          windSpeed: c.wind_speed_10m,
          windDirection: c.wind_direction_10m,
          pressure: c.pressure_msl,
          uvIndex: c.uv_index,
          visibility: null,
          cloudCover: c.cloud_cover,
          precipitation: c.precipitation,
          weatherCode: c.weather_code,
          lastUpdated: Date.now(),
        })
      }

      // Daily forecast
      if (weatherData.daily) {
        const d = weatherData.daily
        const daily: DailyForecast[] = d.time.map((date: string, i: number) => {
          const dayDate = new Date(date + 'T00:00:00')
          return {
            date,
            dayName: dayDate.toLocaleDateString('en', { weekday: 'short' }),
            tempMax: d.temperature_2m_max[i],
            tempMin: d.temperature_2m_min[i],
            weatherCode: d.weather_code[i],
            precipProb: d.precipitation_probability_max?.[i] ?? 0,
            windSpeed: d.wind_speed_10m_max[i],
          }
        })
        setDailyForecast(daily)

        // Sun & Moon
        if (d.sunrise?.[0] && d.sunset?.[0]) {
          const sunriseTime = new Date(d.sunrise[0])
          const sunsetTime = new Date(d.sunset[0])
          const daylightMs = sunsetTime.getTime() - sunriseTime.getTime()

          // Approximate moon phase
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth() + 1
          const day = now.getDate()
          let c = Math.floor(365.25 * year)
          c += Math.floor(30.6 * month)
          c = c - 694039.09 + day
          const moonPhase = (c / 29.53058867) % 1
          const normalizedPhase = moonPhase < 0 ? moonPhase + 1 : moonPhase

          setSunMoon({
            sunrise: sunriseTime.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
            sunset: sunsetTime.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
            moonPhase: getMoonPhaseName(normalizedPhase),
            moonPhaseEmoji: getMoonPhaseEmoji(normalizedPhase),
            daylightHours: Math.round((daylightMs / (1000 * 60 * 60)) * 10) / 10,
          })
        }
      }

      // Hourly forecast (next 24 hours)
      if (weatherData.hourly) {
        const h = weatherData.hourly
        const now = new Date()
        const currentHourIdx = h.time.findIndex((t: string) => new Date(t) >= now)
        const startIdx = Math.max(0, currentHourIdx)
        const hourly: HourlyForecast[] = h.time
          .slice(startIdx, startIdx + 24)
          .map((time: string, i: number) => {
            const hourDate = new Date(time)
            return {
              time,
              hour: hourDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
              temperature: h.temperature_2m[startIdx + i],
              windSpeed: h.wind_speed_10m[startIdx + i],
              precip: h.precipitation[startIdx + i],
              weatherCode: h.weather_code[startIdx + i],
            }
          })
        setHourlyForecast(hourly)
      }

      // Weather alerts (basic logic based on conditions)
      const alerts: WeatherAlert[] = []
      const currentTemp = weatherData.current?.temperature_2m
      const currentWind = weatherData.current?.wind_speed_10m
      const currentWeatherCode = weatherData.current?.weather_code

      if (currentTemp !== undefined) {
        if (currentTemp <= -10) {
          alerts.push({ type: 'frost', title: 'Extreme Cold Warning', description: `Temperature is ${Math.round(currentTemp)}°C. Risk of frostbite and hypothermia.`, severity: 'high' })
        } else if (currentTemp <= 0) {
          alerts.push({ type: 'frost', title: 'Frost Warning', description: `Temperature is ${Math.round(currentTemp)}°C. Icy conditions possible.`, severity: 'medium' })
        }
        if (currentTemp >= 35) {
          alerts.push({ type: 'heat', title: 'Heat Warning', description: `Temperature is ${Math.round(currentTemp)}°C. Stay hydrated and avoid prolonged sun exposure.`, severity: 'high' })
        } else if (currentTemp >= 30) {
          alerts.push({ type: 'heat', title: 'Heat Advisory', description: `Temperature is ${Math.round(currentTemp)}°C. Drink plenty of water.`, severity: 'medium' })
        }
      }
      if (currentWind >= 60) {
        alerts.push({ type: 'storm', title: 'High Wind Warning', description: `Wind speed is ${Math.round(currentWind)} km/h. Dangerous conditions.`, severity: 'high' })
      }
      if (currentWeatherCode >= 95) {
        alerts.push({ type: 'severe', title: 'Thunderstorm Warning', description: 'Active thunderstorm in the area. Seek shelter immediately.', severity: 'high' })
      } else if (currentWeatherCode >= 80) {
        alerts.push({ type: 'storm', title: 'Heavy Rain Alert', description: 'Heavy rainfall expected. Watch for flooding.', severity: 'medium' })
      }
      setWeatherAlerts(alerts)

      // Air Quality from Open-Meteo
      try {
        const aqRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi`
        )
        const aqData = await aqRes.json()
        if (aqData.current) {
          const aq = aqData.current
          setAirQuality({
            aqi: aq.us_aqi ?? 0,
            category: getAqiCategory(aq.us_aqi ?? 0),
            pm25: aq.pm2_5 ?? 0,
            pm10: aq.pm10 ?? 0,
            o3: aq.ozone ?? 0,
            no2: aq.nitrogen_dioxide ?? 0,
            recommendation: getAqiRecommendation(aq.us_aqi ?? 0),
          })
        }
      } catch {
        // Air quality API may not be available for all locations
      }

      toast.success('Weather data updated')
    } catch {
      toast.error('Failed to fetch weather data')
    } finally {
      setIsLoading(false)
    }
  }, [center, setEnhancedWeather])

  function getAqiRecommendation(aqi: number): string {
    if (aqi <= 50) return 'Air quality is satisfactory. Enjoy outdoor activities!'
    if (aqi <= 100) return 'Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.'
    if (aqi <= 150) return 'Sensitive groups may experience health effects. Limit outdoor activities.'
    if (aqi <= 200) return 'Everyone may begin to experience health effects. Reduce outdoor activities.'
    return 'Health alert! Everyone may experience serious health effects. Avoid outdoor activities.'
  }

  // Fetch data when dialog opens
  useEffect(() => {
    if (enhancedWeatherOpen && !fetchedOnce.current) {
      fetchWeatherData()
      fetchedOnce.current = true
    }
    if (!enhancedWeatherOpen) {
      fetchedOnce.current = false
    }
  }, [enhancedWeatherOpen, fetchWeatherData])

  const compassRotation = enhancedWeather.windDirection ?? 0

  // Chart data for daily temperature
  const dailyTempChartData = dailyForecast.map((d) => ({
    name: d.dayName,
    High: convertTemp(d.tempMax),
    Low: convertTemp(d.tempMin),
  }))

  // Chart data for daily precipitation
  const dailyPrecipChartData = dailyForecast.map((d) => ({
    name: d.dayName,
    Precipitation: d.precipProb,
  }))

  // Chart data for hourly temperature
  const hourlyTempChartData = hourlyForecast.map((h) => ({
    name: h.hour,
    Temp: convertTemp(h.temperature),
    Precip: h.precip,
  }))

  return (
    <Dialog open={enhancedWeatherOpen} onOpenChange={setEnhancedWeatherOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <CloudSun className="h-5 w-5 text-amber-500" />
              Enhanced Weather Dashboard
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setTemperatureUnit(temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius')}
              >
                <Thermometer className="h-3.5 w-3.5 mr-1" />
                {temperatureUnit === 'celsius' ? '°C → °F' : '°F → °C'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={fetchWeatherData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-60px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5 h-8">
              <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs">7-Day</TabsTrigger>
              <TabsTrigger value="hourly" className="text-xs">Hourly</TabsTrigger>
              <TabsTrigger value="air" className="text-xs">Air</TabsTrigger>
              <TabsTrigger value="sun" className="text-xs">Sun/Moon</TabsTrigger>
            </TabsList>

            {/* Current Weather Tab */}
            <TabsContent value="current" className="mt-3 space-y-3">
              {enhancedWeather.temperature !== null ? (
                <>
                  {/* Main temperature display */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="text-5xl">{getWeatherEmoji(enhancedWeather.weatherCode ?? 0)}</div>
                    <div>
                      <div className="text-4xl font-bold">
                        {convertTemp(enhancedWeather.temperature)}{tempUnit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getWeatherDescription(enhancedWeather.weatherCode ?? 0)}
                      </div>
                      {enhancedWeather.feelsLike !== null && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Feels like {convertTemp(enhancedWeather.feelsLike)}{tempUnit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weather details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="border rounded-lg p-3 text-center">
                      <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.humidity ?? '--'}%</div>
                      <div className="text-[10px] text-muted-foreground">Humidity</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <Gauge className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.pressure?.toFixed(0) ?? '--'}</div>
                      <div className="text-[10px] text-muted-foreground">Pressure (hPa)</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <Wind className="h-4 w-4 mx-auto mb-1 text-teal-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.windSpeed?.toFixed(1) ?? '--'}</div>
                      <div className="text-[10px] text-muted-foreground">Wind (km/h)</div>
                      {enhancedWeather.windDirection !== null && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <div
                            className="inline-block transition-transform"
                            style={{ transform: `rotate(${compassRotation}deg)` }}
                          >
                            ↑
                          </div>
                          <span className="text-[10px]">{getWindDirection(enhancedWeather.windDirection)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <Sun className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <div className={`text-lg font-semibold ${getUvLabel(enhancedWeather.uvIndex ?? 0).color}`}>
                        {enhancedWeather.uvIndex?.toFixed(1) ?? '--'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        UV · {getUvLabel(enhancedWeather.uvIndex ?? 0).label}
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <Eye className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.visibility ?? '--'}</div>
                      <div className="text-[10px] text-muted-foreground">Visibility</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <CloudSun className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.cloudCover ?? '--'}%</div>
                      <div className="text-[10px] text-muted-foreground">Cloud Cover</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <CloudRain className="h-4 w-4 mx-auto mb-1 text-cyan-500" />
                      <div className="text-lg font-semibold">{enhancedWeather.precipitation?.toFixed(1) ?? '--'}</div>
                      <div className="text-[10px] text-muted-foreground">Precip. (mm)</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <MapPin className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                      <div className="text-xs font-medium">
                        {center[1].toFixed(2)}°, {center[0].toFixed(2)}°
                      </div>
                      <div className="text-[10px] text-muted-foreground">Location</div>
                    </div>
                  </div>

                  {/* Weather Alerts */}
                  {weatherAlerts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" /> Weather Alerts
                      </div>
                      {weatherAlerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`border rounded-lg p-2.5 text-xs ${
                            alert.severity === 'high'
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                              : alert.severity === 'medium'
                                ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                          }`}
                        >
                          <div className="font-semibold flex items-center gap-1">
                            {alert.type === 'severe' && '⚠️'}
                            {alert.type === 'frost' && '❄️'}
                            {alert.type === 'heat' && '🔥'}
                            {alert.type === 'storm' && '🌪️'}
                            {alert.title}
                          </div>
                          <div className="text-muted-foreground mt-0.5">{alert.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <CloudSun className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  Click the refresh button to load weather data
                </div>
              )}
            </TabsContent>

            {/* 7-Day Forecast Tab */}
            <TabsContent value="forecast" className="mt-3 space-y-3">
              {dailyForecast.length > 0 ? (
                <>
                  {/* Daily list */}
                  <div className="space-y-1.5">
                    {dailyForecast.map((day, i) => (
                      <div key={i} className="flex items-center gap-3 border rounded-lg p-2.5">
                        <span className="text-xl w-8 text-center">{getWeatherEmoji(day.weatherCode)}</span>
                        <div className="w-10 text-xs font-medium">{day.dayName}</div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-red-500">{convertTemp(day.tempMax)}°</span>
                          <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-blue-300 to-red-300 relative mx-1">
                            <div
                              className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500"
                              style={{
                                left: `${((day.tempMin - dailyForecast.reduce((min, d) => Math.min(min, d.tempMin), 100)) / (dailyForecast.reduce((max, d) => Math.max(max, d.tempMax), -100) - dailyForecast.reduce((min, d) => Math.min(min, d.tempMin), 100))) * 100}%`,
                                width: `${((day.tempMax - day.tempMin) / (dailyForecast.reduce((max, d) => Math.max(max, d.tempMax), -100) - dailyForecast.reduce((min, d) => Math.min(min, d.tempMin), 100))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-blue-500">{convertTemp(day.tempMin)}°</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground w-16">
                          <CloudRain className="h-3 w-3" />
                          {day.precipProb}%
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground w-16">
                          <Wind className="h-3 w-3" />
                          {day.windSpeed}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Temperature Trend Chart */}
                  <div className="border rounded-lg p-3">
                    <div className="text-xs font-medium mb-2">Temperature Trend ({tempUnit})</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={dailyTempChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-[10px]" />
                        <YAxis className="text-[10px]" />
                        <RechartsTooltip
                          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="High" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Low" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Precipitation Chart */}
                  <div className="border rounded-lg p-3">
                    <div className="text-xs font-medium mb-2">Precipitation Probability (%)</div>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={dailyPrecipChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-[10px]" />
                        <YAxis className="text-[10px]" domain={[0, 100]} />
                        <RechartsTooltip
                          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        <Bar dataKey="Precipitation" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No forecast data available. Refresh to load.
                </div>
              )}
            </TabsContent>

            {/* Hourly Forecast Tab */}
            <TabsContent value="hourly" className="mt-3 space-y-3">
              {hourlyForecast.length > 0 ? (
                <>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs font-medium mb-2">Hourly Temperature & Precipitation</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={hourlyTempChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="name"
                          className="text-[10px]"
                          interval={2}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis className="text-[10px]" />
                        <RechartsTooltip
                          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area
                          type="monotone"
                          dataKey="Temp"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="Precip"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hourly list */}
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1 pr-2">
                      {hourlyForecast.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 border rounded-lg p-2 text-xs">
                          <span className="text-lg w-7 text-center">{getWeatherEmoji(h.weatherCode)}</span>
                          <span className="w-12 font-medium">{h.hour}</span>
                          <span className="w-14 font-semibold">{convertTemp(h.temperature)}{tempUnit}</span>
                          <div className="flex items-center gap-1 flex-1">
                            <Wind className="h-3 w-3" />
                            <span>{h.windSpeed} km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CloudRain className="h-3 w-3" />
                            <span>{h.precip} mm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No hourly data available. Refresh to load.
                </div>
              )}
            </TabsContent>

            {/* Air Quality Tab */}
            <TabsContent value="air" className="mt-3 space-y-3">
              {airQuality ? (
                <>
                  <div className="text-center py-4">
                    <div className={`text-5xl font-bold ${getAqiColor(airQuality.aqi)}`}>
                      {airQuality.aqi}
                    </div>
                    <div className="text-lg font-medium mt-1">{airQuality.category}</div>
                    <div className="text-xs text-muted-foreground mt-1">US AQI Index</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-amber-600">{airQuality.pm25.toFixed(1)}</div>
                      <div className="text-[10px] text-muted-foreground">PM2.5 (µg/m³)</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-orange-600">{airQuality.pm10.toFixed(1)}</div>
                      <div className="text-[10px] text-muted-foreground">PM10 (µg/m³)</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-teal-600">{airQuality.o3.toFixed(1)}</div>
                      <div className="text-[10px] text-muted-foreground">O₃ (µg/m³)</div>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-red-600">{airQuality.no2.toFixed(1)}</div>
                      <div className="text-[10px] text-muted-foreground">NO₂ (µg/m³)</div>
                    </div>
                  </div>

                  {/* AQI Scale */}
                  <div className="border rounded-lg p-3">
                    <div className="text-xs font-medium mb-2">AQI Scale</div>
                    <div className="flex h-4 rounded overflow-hidden">
                      <div className="flex-1 bg-emerald-500" />
                      <div className="flex-1 bg-yellow-500" />
                      <div className="flex-1 bg-orange-500" />
                      <div className="flex-1 bg-red-500" />
                      <div className="flex-1 bg-purple-500" />
                      <div className="flex-1 bg-rose-900" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>0 Good</span>
                      <span>50</span>
                      <span>100</span>
                      <span>150</span>
                      <span>200</span>
                      <span>300+</span>
                    </div>
                    {/* Indicator */}
                    <div className="relative mt-0.5">
                      <div
                        className="absolute w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground"
                        style={{
                          left: `${Math.min(100, (airQuality.aqi / 500) * 100)}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Health Recommendation */}
                  <div className="border rounded-lg p-3 bg-card">
                    <div className="text-xs font-medium flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Health Recommendation
                    </div>
                    <div className="text-xs text-muted-foreground">{airQuality.recommendation}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Wind className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  Air quality data not available for this location.
                </div>
              )}
            </TabsContent>

            {/* Sun & Moon Tab */}
            <TabsContent value="sun" className="mt-3 space-y-3">
              {sunMoon ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border rounded-lg p-4 text-center">
                      <Sunrise className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                      <div className="text-xl font-bold">{sunMoon.sunrise}</div>
                      <div className="text-xs text-muted-foreground">Sunrise</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <Sunset className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                      <div className="text-xl font-bold">{sunMoon.sunset}</div>
                      <div className="text-xs text-muted-foreground">Sunset</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 text-center">
                    <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-xl font-bold">{sunMoon.daylightHours}h</div>
                    <div className="text-xs text-muted-foreground">Daylight Hours</div>
                  </div>

                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{sunMoon.moonPhaseEmoji}</div>
                    <div className="text-sm font-medium">{sunMoon.moonPhase}</div>
                    <div className="text-xs text-muted-foreground">Current Moon Phase</div>
                  </div>

                  {/* Historical comparison note */}
                  <div className="border rounded-lg p-3 bg-card">
                    <div className="text-xs font-medium flex items-center gap-1 mb-1">
                      <Moon className="h-3.5 w-3.5" /> Historical Comparison
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current daylight hours ({sunMoon.daylightHours}h) are compared to the seasonal average.
                      At this latitude ({center[1].toFixed(1)}°), the typical range is between ~8-16 hours
                      depending on the season.
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Moon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  Sun & Moon data not available. Refresh to load.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
