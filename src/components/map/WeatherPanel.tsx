'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudSun, Droplets, Wind, Thermometer, X, Loader2, Minus } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

// WMO Weather Code to emoji and description mapping
const WMO_CODES: Record<number, { emoji: string; description: string; gradient: string; accent: 'warm' | 'cold' | 'neutral' }> = {
  0: { emoji: '☀️', description: 'Clear sky', gradient: 'from-amber-400/20 to-orange-300/10', accent: 'warm' },
  1: { emoji: '🌤️', description: 'Mainly clear', gradient: 'from-amber-300/20 to-yellow-200/10', accent: 'warm' },
  2: { emoji: '⛅', description: 'Partly cloudy', gradient: 'from-sky-300/20 to-gray-200/10', accent: 'neutral' },
  3: { emoji: '🌥️', description: 'Overcast', gradient: 'from-gray-400/20 to-gray-300/10', accent: 'neutral' },
  45: { emoji: '🌫️', description: 'Fog', gradient: 'from-gray-300/20 to-gray-200/10', accent: 'neutral' },
  48: { emoji: '🌫️', description: 'Depositing rime fog', gradient: 'from-gray-300/20 to-blue-100/10', accent: 'cold' },
  51: { emoji: '🌦️', description: 'Light drizzle', gradient: 'from-sky-400/20 to-sky-300/10', accent: 'cold' },
  53: { emoji: '🌦️', description: 'Moderate drizzle', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  55: { emoji: '🌧️', description: 'Dense drizzle', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  56: { emoji: '🌧️', description: 'Freezing drizzle', gradient: 'from-blue-500/20 to-sky-300/10', accent: 'cold' },
  57: { emoji: '🌧️', description: 'Dense freezing drizzle', gradient: 'from-blue-600/20 to-sky-400/10', accent: 'cold' },
  61: { emoji: '🌧️', description: 'Slight rain', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  63: { emoji: '🌧️', description: 'Moderate rain', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  65: { emoji: '🌧️', description: 'Heavy rain', gradient: 'from-sky-700/20 to-sky-500/10', accent: 'cold' },
  66: { emoji: '🌧️', description: 'Freezing rain', gradient: 'from-blue-600/20 to-sky-400/10', accent: 'cold' },
  67: { emoji: '🌧️', description: 'Heavy freezing rain', gradient: 'from-blue-700/20 to-sky-500/10', accent: 'cold' },
  71: { emoji: '❄️', description: 'Slight snow', gradient: 'from-blue-200/20 to-white/10', accent: 'cold' },
  73: { emoji: '❄️', description: 'Moderate snow', gradient: 'from-blue-300/20 to-blue-100/10', accent: 'cold' },
  75: { emoji: '🌨️', description: 'Heavy snow', gradient: 'from-blue-400/20 to-blue-200/10', accent: 'cold' },
  77: { emoji: '🌨️', description: 'Snow grains', gradient: 'from-blue-300/20 to-white/10', accent: 'cold' },
  80: { emoji: '🌦️', description: 'Slight rain showers', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  81: { emoji: '🌧️', description: 'Moderate rain showers', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  82: { emoji: '🌧️', description: 'Violent rain showers', gradient: 'from-sky-700/20 to-sky-500/10', accent: 'cold' },
  85: { emoji: '🌨️', description: 'Slight snow showers', gradient: 'from-blue-300/20 to-blue-100/10', accent: 'cold' },
  86: { emoji: '🌨️', description: 'Heavy snow showers', gradient: 'from-blue-400/20 to-blue-200/10', accent: 'cold' },
  95: { emoji: '⛈️', description: 'Thunderstorm', gradient: 'from-purple-600/20 to-sky-500/10', accent: 'neutral' },
  96: { emoji: '⛈️', description: 'Thunderstorm with hail', gradient: 'from-purple-700/20 to-sky-500/10', accent: 'neutral' },
  99: { emoji: '⛈️', description: 'Thunderstorm with heavy hail', gradient: 'from-purple-800/20 to-sky-600/10', accent: 'neutral' },
}

function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { emoji: '🌡️', description: 'Unknown', gradient: 'from-gray-400/20 to-gray-200/10', accent: 'neutral' as const }
}

function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return dirs[index]
}

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
  }
  hourly: {
    temperature_2m: number[]
    precipitation_probability: number[]
    time: string[]
  }
}

export function WeatherPanel() {
  const { weatherEnabled, center, setWeatherEnabled } = useMapStore()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const lastFetchCenter = useRef<[number, number] | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [minimized, setMinimized] = useState(false)

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`)
      if (!res.ok) {
        throw new Error('Failed to fetch weather')
      }
      const data: WeatherData = await res.json()
      setWeatherData(data)

      // Try reverse geocoding for location name
      try {
        const geoRes = await fetch(`/api/search?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`)
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.name) {
            setLocationName(geoData.name)
          } else {
            setLocationName(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`)
          }
        } else {
          setLocationName(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`)
        }
      } catch {
        setLocationName(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`)
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to fetch weather')
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced fetch when center changes
  useEffect(() => {
    if (!weatherEnabled) return

    const [lng, lat] = center
    const lastCenter = lastFetchCenter.current

    // Check if center changed significantly (> 0.05 degrees ≈ 5km)
    if (lastCenter) {
      const dist = Math.sqrt(
        Math.pow(lng - lastCenter[0], 2) + Math.pow(lat - lastCenter[1], 2)
      )
      if (dist < 0.05) return
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      lastFetchCenter.current = [lng, lat]
      fetchWeather(lat, lng)
    }, 800)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [center, weatherEnabled, fetchWeather])

  // Initial fetch when weather is enabled
  useEffect(() => {
    if (weatherEnabled && !weatherData && !loading) {
      const [lng, lat] = center
      lastFetchCenter.current = [lng, lat]
      fetchWeather(lat, lng)
    }
  }, [weatherEnabled, weatherData, loading, center, fetchWeather])

  // Reset state when disabled
  useEffect(() => {
    if (!weatherEnabled) {
      setWeatherData(null)
      setLocationName('')
      setError(null)
    }
  }, [weatherEnabled])

  if (!weatherEnabled) return null

  const weatherInfo = weatherData ? getWeatherInfo(weatherData.current.weather_code) : null
  const accentClass = weatherInfo
    ? weatherInfo.accent === 'warm'
      ? 'weather-accent-warm'
      : weatherInfo.accent === 'cold'
        ? 'weather-accent-cold'
        : 'weather-accent-neutral'
    : 'weather-accent-neutral'

  // Get next 6 hours of forecast (from current hour)
  const now = new Date()
  const currentHourIndex = weatherData?.hourly.time.findIndex(t => new Date(t) >= now) ?? -1
  const forecastHours = weatherData?.hourly.temperature_2m.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + 6
  ) ?? []

  const forecastPrecip = weatherData?.hourly.precipitation_probability.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + 6
  ) ?? []

  const forecastTimes = weatherData?.hourly.time.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + 6
  ) ?? []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'glass-card rounded-2xl shadow-xl overflow-hidden',
          accentClass
        )}
        style={{ minWidth: minimized ? 48 : 280, maxWidth: 300, backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        {/* Gradient header */}
        <div className={`relative bg-gradient-to-r ${weatherInfo?.gradient || 'from-gray-400/20 to-gray-200/10'}`}>
          <div className="p-3 flex items-start gap-3">
            {minimized ? (
              <button
                onClick={() => setMinimized(false)}
                className="flex items-center justify-center w-full"
                aria-label="Expand weather panel"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : weatherInfo ? (
                  <span className="text-2xl">{weatherInfo.emoji}</span>
                ) : (
                  <CloudSun className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  {loading && !weatherData ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Fetching weather...</span>
                    </div>
                  ) : error ? (
                    <div className="text-xs text-destructive">{error}</div>
                  ) : weatherData ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{weatherInfo?.emoji}</span>
                        <div>
                          <p className="text-3xl font-bold tabular-nums leading-tight">
                            {weatherData.current.temperature_2m.toFixed(1)}°C
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {weatherInfo?.description}
                          </p>
                        </div>
                      </div>
                      {weatherData.current.apparent_temperature !== weatherData.current.temperature_2m && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Feels like {weatherData.current.apparent_temperature.toFixed(1)}°C
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setMinimized(true)}
                    className="p-1 hover:bg-background/50 rounded-lg transition-colors"
                    aria-label="Minimize weather panel"
                  >
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setWeatherEnabled(false)}
                    className="p-1 hover:bg-background/50 rounded-lg transition-colors"
                    aria-label="Close weather panel"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {!minimized && (
          <div className="px-3 pb-3">
            {/* Location name */}
            {locationName && (
              <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                <CloudSun className="h-2.5 w-2.5" />
                {locationName}
              </p>
            )}

            {/* Stats grid */}
            {weatherData && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                  <Droplets className="h-3 w-3 text-sky-500" />
                  <span className="text-[10px] text-muted-foreground">Humidity</span>
                  <span className="text-xs font-semibold tabular-nums">
                    {weatherData.current.relative_humidity_2m}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                  <Wind className="h-3 w-3 text-teal-500" />
                  <span className="text-[10px] text-muted-foreground">Wind</span>
                  <span className="text-xs font-semibold tabular-nums">
                    {weatherData.current.wind_speed_10m.toFixed(0)} km/h
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  <span className="text-[10px] text-muted-foreground">Precip</span>
                  <span className="text-xs font-semibold tabular-nums">
                    {weatherData.current.precipitation.toFixed(1)} mm
                  </span>
                </div>
              </div>
            )}

            {/* Wind direction */}
            {weatherData && weatherData.current.wind_direction_10m !== undefined && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] text-muted-foreground">Wind direction:</span>
                <span className="text-xs font-medium">
                  {getWindDirection(weatherData.current.wind_direction_10m)} ({weatherData.current.wind_direction_10m.toFixed(0)}°)
                </span>
              </div>
            )}

            {/* Hourly forecast - horizontal scroll with snap */}
            {weatherData && forecastHours.length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Next hours</p>
                <div className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {forecastHours.map((temp, i) => {
                    const time = forecastTimes[i]
                    const precip = forecastPrecip[i]
                    const hour = time ? new Date(time).getHours() : ''
                    const isNow = i === 0
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg shrink-0 snap-start transition-colors ${
                          isNow ? 'bg-primary/10' : 'bg-background/50'
                        }`}
                      >
                        <span className="text-[9px] text-muted-foreground">
                          {isNow ? 'Now' : `${hour}:00`}
                        </span>
                        <span className="text-[11px] font-semibold tabular-nums">
                          {temp.toFixed(0)}°
                        </span>
                        {precip > 0 && (
                          <span className="text-[9px] text-sky-500">
                            {precip}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Data source credit */}
            <p className="text-[8px] text-muted-foreground/50 mt-2 text-center">
              Data from Open-Meteo.com
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
