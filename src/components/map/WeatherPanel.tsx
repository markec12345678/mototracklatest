'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudSun, Droplets, Wind, Thermometer, X, Loader2, Minus } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { getWeatherInfo, getWindDirection } from '@/lib/weather-utils'

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
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    precipitation_sum: number[]
    wind_speed_10m_max: number[]
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

  // Get next hours of forecast (from current hour) — 4 on mobile, 6 on desktop
  const now = new Date()
  const currentHourIndex = weatherData?.hourly.time.findIndex(t => new Date(t) >= now) ?? -1
  const forecastCount = 6
  const forecastHours = weatherData?.hourly.temperature_2m.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + forecastCount
  ) ?? []

  const forecastPrecip = weatherData?.hourly.precipitation_probability.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + forecastCount
  ) ?? []

  const forecastTimes = weatherData?.hourly.time.slice(
    Math.max(0, currentHourIndex),
    Math.max(0, currentHourIndex) + forecastCount
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
        style={{ minWidth: minimized ? 48 : undefined, maxWidth: 300, width: minimized ? 48 : undefined, backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        {/* Gradient header */}
        <div className={`relative bg-gradient-to-r ${weatherInfo?.gradient || 'from-gray-400/20 to-gray-200/10'}`}>
          <div className="p-2.5 sm:p-3 flex items-start gap-2 sm:gap-3">
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
                        <span className="text-2xl sm:text-3xl">{weatherInfo?.emoji}</span>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold tabular-nums leading-tight">
                            {weatherData.current.temperature_2m.toFixed(1)}°C
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                            {weatherInfo?.description}
                          </p>
                        </div>
                      </div>
                      {weatherData.current.apparent_temperature !== weatherData.current.temperature_2m && (
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
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
          <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            {/* Location name */}
            {locationName && (
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                <CloudSun className="h-2.5 w-2.5" />
                {locationName}
              </p>
            )}

            {/* Stats grid */}
            {weatherData && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <div className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-lg bg-background/50">
                  <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-sky-500" />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">Humidity</span>
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums">
                    {weatherData.current.relative_humidity_2m}%
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-lg bg-background/50">
                  <Wind className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-500" />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">Wind</span>
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums">
                    {weatherData.current.wind_speed_10m.toFixed(0)} km/h
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-lg bg-background/50">
                  <Thermometer className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-500" />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">Precip</span>
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums">
                    {weatherData.current.precipitation.toFixed(1)} mm
                  </span>
                </div>
              </div>
            )}

            {/* Wind direction */}
            {weatherData && weatherData.current.wind_direction_10m !== undefined && (
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2 px-1">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">Wind direction:</span>
                <span className="text-[10px] sm:text-xs font-medium">
                  {getWindDirection(weatherData.current.wind_direction_10m)} ({weatherData.current.wind_direction_10m.toFixed(0)}°)
                </span>
              </div>
            )}

            {/* Hourly forecast - horizontal scroll with snap */}
            {weatherData && forecastHours.length > 0 && (
              <div className="mt-1">
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mb-1 sm:mb-1.5">Next hours</p>
                <div className="flex gap-1 sm:gap-1.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {forecastHours.map((temp, i) => {
                    const time = forecastTimes[i]
                    const precip = forecastPrecip[i]
                    const hour = time ? new Date(time).getHours() : ''
                    const isNow = i === 0
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg shrink-0 snap-start transition-colors ${
                          isNow ? 'bg-primary/10' : 'bg-background/50'
                        }`}
                      >
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground">
                          {isNow ? 'Now' : `${hour}:00`}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-semibold tabular-nums">
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

            {/* 7-Day Forecast */}
            {weatherData?.daily && weatherData.daily.time.length > 0 && (
              <div className="mt-1.5 sm:mt-2">
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mb-1 sm:mb-1.5">7-Day Forecast</p>
                <div className="flex gap-1 sm:gap-1.5 overflow-x-auto snap-x snap-mandatory pb-1 sm:grid sm:grid-cols-7 sm:overflow-x-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {weatherData.daily.time.map((dateStr, i) => {
                    const date = new Date(dateStr + 'T00:00:00')
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    const isToday = new Date().toDateString() === date.toDateString()
                    const dayInfo = getWeatherInfo(weatherData.daily!.weather_code[i])
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center gap-0.5 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg shrink-0 snap-start transition-colors min-w-[44px] sm:min-w-[52px] ${
                          isToday ? 'bg-primary/10' : 'bg-background/50'
                        }`}
                      >
                        <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground">
                          {isToday ? 'Today' : dayNames[date.getDay()]}
                        </span>
                        <span className="text-xs sm:text-sm leading-none">{dayInfo.emoji}</span>
                        <span className="text-[10px] sm:text-[11px] font-semibold tabular-nums">
                          {weatherData.daily!.temperature_2m_max[i].toFixed(0)}°
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground tabular-nums">
                          {weatherData.daily!.temperature_2m_min[i].toFixed(0)}°
                        </span>
                        {weatherData.daily!.precipitation_sum[i] > 0 && (
                          <span className="text-[8px] text-sky-500 tabular-nums">
                            {weatherData.daily!.precipitation_sum[i].toFixed(1)}mm
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
