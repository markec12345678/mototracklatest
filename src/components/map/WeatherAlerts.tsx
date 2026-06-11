'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, CloudRain, ThermometerSun, ThermometerSnowflake, CloudLightning, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WeatherAlert {
  type: 'strong-wind' | 'heavy-rain' | 'extreme-heat' | 'extreme-cold' | 'thunderstorm'
  severity: 'yellow' | 'orange' | 'red'
  title: string
  description: string
  icon: React.ReactNode
}

interface WeatherAlertsProps {
  windSpeed?: number
  precipitation?: number
  tempMax?: number
  tempMin?: number
  weatherCode?: number
}

function getAlertsFromConditions(props: WeatherAlertsProps): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  if (props.windSpeed !== undefined && props.windSpeed > 50) {
    alerts.push({
      type: 'strong-wind',
      severity: props.windSpeed > 80 ? 'red' : props.windSpeed > 65 ? 'orange' : 'yellow',
      title: 'Strong Wind',
      description: `Wind speed ${Math.round(props.windSpeed)} km/h`,
      icon: <Wind className="h-3.5 w-3.5" />,
    })
  }

  if (props.precipitation !== undefined && props.precipitation > 10) {
    alerts.push({
      type: 'heavy-rain',
      severity: props.precipitation > 30 ? 'red' : props.precipitation > 20 ? 'orange' : 'yellow',
      title: 'Heavy Rain',
      description: `${props.precipitation.toFixed(1)} mm expected`,
      icon: <CloudRain className="h-3.5 w-3.5" />,
    })
  }

  if (props.tempMax !== undefined && props.tempMax > 35) {
    alerts.push({
      type: 'extreme-heat',
      severity: props.tempMax > 42 ? 'red' : props.tempMax > 38 ? 'orange' : 'yellow',
      title: 'Extreme Heat',
      description: `High of ${Math.round(props.tempMax)}°C`,
      icon: <ThermometerSun className="h-3.5 w-3.5" />,
    })
  }

  if (props.tempMin !== undefined && props.tempMin < -10) {
    alerts.push({
      type: 'extreme-cold',
      severity: props.tempMin < -25 ? 'red' : props.tempMin < -15 ? 'orange' : 'yellow',
      title: 'Extreme Cold',
      description: `Low of ${Math.round(props.tempMin)}°C`,
      icon: <ThermometerSnowflake className="h-3.5 w-3.5" />,
    })
  }

  if (props.weatherCode !== undefined && (props.weatherCode >= 95)) {
    alerts.push({
      type: 'thunderstorm',
      severity: props.weatherCode >= 96 ? 'red' : 'orange',
      title: 'Thunderstorm',
      description: props.weatherCode >= 96 ? 'Thunderstorm with hail expected' : 'Thunderstorm expected',
      icon: <CloudLightning className="h-3.5 w-3.5" />,
    })
  }

  return alerts
}

const severityColors = {
  yellow: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  orange: {
    bg: 'bg-orange-500/10 border-orange-500/30',
    text: 'text-orange-700 dark:text-orange-400',
    icon: 'text-orange-500',
    dot: 'bg-orange-500',
  },
  red: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-700 dark:text-red-400',
    icon: 'text-red-500',
    dot: 'bg-red-500',
  },
}

export function WeatherAlerts(props: WeatherAlertsProps) {
  const alerts = useMemo(() => getAlertsFromConditions(props), [props])

  if (alerts.length === 0) return null

  return (
    <AnimatePresence>
      <div className="space-y-1.5">
        {alerts.map((alert, i) => {
          const colors = severityColors[alert.severity]
          return (
            <motion.div
              key={`${alert.type}-${i}`}
              initial={{ opacity: 0, y: -5, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.97 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-xs',
                colors.bg,
                colors.text,
                alert.severity === 'red' && 'animate-pulse'
              )}
            >
              <div className={cn('shrink-0', colors.icon)}>
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  <span className="font-semibold">{alert.title}</span>
                </div>
                <span className="opacity-80">{alert.description}</span>
              </div>
              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)} />
            </motion.div>
          )
        })}
      </div>
    </AnimatePresence>
  )
}

export { getAlertsFromConditions }
