'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudSun, Droplets, Wind, Thermometer, X, Loader2, ChevronDown } from 'lucide-react'
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

export function MobileWeatherBar() {
  const { weatherEnabled, center, setWeatherEnabled } = useMapStore()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetchCenter = useRef<[number, number] | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to fetch weather')
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced fetch when center changes (>5km / >0.05 degrees)
  useEffect(() => {
    if (!weatherEnabled) return

    const [lng, lat] = center
    const lastCenter = lastFetchCenter.current

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
      setError(null)
      setExpanded(false)
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

  // Get next 6 hours of forecast
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Compact bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'glass-card w-full flex items-center gap-2.5 px-3 py-2 rounded-xl shadow-lg transition-all duration-200',
            accentClass,
            expanded && 'rounded-b-none'
          )}
          aria-label={expanded ? 'Collapse weather details' : 'Expand weather details'}
          aria-expanded={expanded}
        >
          {loading && !weatherData ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
          ) : weatherInfo ? (
            <span className="text-lg leading-none">{weatherInfo.emoji}</span>
          ) : (
            <CloudSun className="h-4 w-4 text-muted-foreground shrink-0" />
          )}

          {weatherData ? (
            <>
              <span className="text-sm font-semibold tabular-nums">
                {weatherData.current.temperature_2m.toFixed(0)}°C
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {weatherInfo?.description}
              </span>
            </>
          ) : error ? (
            <span className="text-xs text-destructive">{error}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Loading weather...</span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {loading && weatherData && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        {/* Expanded details panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-b-xl rounded-t-none border-t-0 shadow-lg px-3 py-3 space-y-3">
                {/* Close button */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Weather Details
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setWeatherEnabled(false)
                    }}
                    className="p-1 hover:bg-accent/50 rounded-lg transition-colors"
                    aria-label="Close weather panel"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>

                {weatherData ? (
                  <>
                    {/* Temperature + feels like */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{weatherInfo?.emoji}</span>
                        <div>
                          <p className="text-xl font-bold tabular-nums leading-tight">
                            {weatherData.current.temperature_2m.toFixed(1)}°C
                          </p>
                          {weatherData.current.apparent_temperature !== weatherData.current.temperature_2m && (
                            <p className="text-[10px] text-muted-foreground">
                              Feels like {weatherData.current.apparent_temperature.toFixed(1)}°C
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                        <Droplets className="h-3 w-3 text-sky-500" />
                        <span className="text-[9px] text-muted-foreground">Humidity</span>
                        <span className="text-[11px] font-semibold tabular-nums">
                          {weatherData.current.relative_humidity_2m}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                        <Wind className="h-3 w-3 text-teal-500" />
                        <span className="text-[9px] text-muted-foreground">Wind</span>
                        <span className="text-[11px] font-semibold tabular-nums">
                          {weatherData.current.wind_speed_10m.toFixed(0)} km/h
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-background/50">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span className="text-[9px] text-muted-foreground">Precip</span>
                        <span className="text-[11px] font-semibold tabular-nums">
                          {weatherData.current.precipitation.toFixed(1)} mm
                        </span>
                      </div>
                    </div>

                    {/* Wind direction */}
                    {weatherData.current.wind_direction_10m !== undefined && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-muted-foreground">Wind direction:</span>
                        <span className="text-[11px] font-medium">
                          {getWindDirection(weatherData.current.wind_direction_10m)} ({weatherData.current.wind_direction_10m.toFixed(0)}°)
                        </span>
                      </div>
                    )}

                    {/* Hourly forecast */}
                    {forecastHours.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Next hours</p>
                        <div
                          className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory pb-1"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {forecastHours.map((temp, i) => {
                            const time = forecastTimes[i]
                            const precip = forecastPrecip[i]
                            const hour = time ? new Date(time).getHours() : ''
                            const isNow = i === 0
                            return (
                              <div
                                key={i}
                                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg shrink-0 snap-start transition-colors ${
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

                    {/* 3-Day Forecast preview */}
                    {weatherData?.daily && weatherData.daily.time.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium mb-1.5">3-Day Forecast</p>
                        <div className="flex gap-2">
                          {weatherData.daily.time.slice(0, 3).map((dateStr, i) => {
                            const date = new Date(dateStr + 'T00:00:00')
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                            const isToday = new Date().toDateString() === date.toDateString()
                            const dayInfo = getWeatherInfo(weatherData.daily!.weather_code[i])
                            return (
                              <div
                                key={i}
                                className={`flex flex-col items-center gap-0.5 flex-1 px-2 py-1.5 rounded-lg transition-colors ${
                                  isToday ? 'bg-primary/10' : 'bg-background/50'
                                }`}
                              >
                                <span className="text-[9px] font-medium text-muted-foreground">
                                  {isToday ? 'Today' : dayNames[date.getDay()]}
                                </span>
                                <span className="text-sm leading-none">{dayInfo.emoji}</span>
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-[11px] font-semibold tabular-nums">
                                    {weatherData.daily!.temperature_2m_max[i].toFixed(0)}°
                                  </span>
                                  <span className="text-[9px] text-muted-foreground tabular-nums">
                                    {weatherData.daily!.temperature_2m_min[i].toFixed(0)}°
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Data source credit */}
                    <p className="text-[8px] text-muted-foreground/50 text-center">
                      Data from Open-Meteo.com
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    ) : error ? (
                      <span className="text-xs text-destructive">{error}</span>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
