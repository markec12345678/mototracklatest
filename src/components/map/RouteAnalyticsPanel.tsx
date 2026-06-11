'use client'

import { useMemo } from 'react'
import {
  Route,
  Car,
  Bike,
  Footprints,
  Flame,
  Leaf,
  TrendingUp,
  Mountain,
  Ruler,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MapRoute } from '@/lib/map-store'
import { useTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function AnimatedNumber({ value, suffix = '' }: { value: string | number; suffix?: string }) {
  return (
    <span className="text-lg font-bold tabular-nums transition-all duration-300">
      {value}
      {suffix}
    </span>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  suffix?: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-border/30 bg-background/50 p-3 flex items-center gap-3">
      <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg shrink-0', color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
    </div>
  )
}

function RouteAnalyticsContent({ route }: { route: MapRoute }) {
  const { t } = useTranslation()

  const analytics = useMemo(() => {
    const distance = route.distance ?? 0
    const distanceKm = distance
    const distanceMi = distance * 0.621371

    // Calculate straight-line distance
    let straightLine = 0
    if (route.points.length >= 2) {
      const first = route.points[0]
      const last = route.points[route.points.length - 1]
      straightLine = haversineDistance(first.latitude, first.longitude, last.latitude, last.longitude)
    }

    // Efficiency (directness ratio)
    const efficiency = distance > 0 ? Math.min((straightLine / distance) * 100, 100) : 0

    // Duration estimates (minutes)
    const drivingMinutes = (distance / 80) * 60 // ~80 km/h average
    const cyclingMinutes = (distance / 20) * 60 // ~20 km/h average
    const walkingMinutes = (distance / 5) * 60 // ~5 km/h average

    // Calories burned
    const walkingCal = Math.round(distance * 60) // ~60 cal/km walking
    const cyclingCal = Math.round(distance * 30) // ~30 cal/km cycling

    // CO2 emissions for driving (gCO2/km, average car ~120g/km)
    const co2Driving = Math.round(distance * 120)

    // Generate elevation profile data (simulated from route points)
    const elevationData = route.points.map((p, i) => ({
      point: i + 1,
      elevation: Math.sin(i * 0.5) * 200 + 300 + Math.random() * 50,
    }))

    return {
      distanceKm,
      distanceMi,
      efficiency,
      drivingMinutes,
      cyclingMinutes,
      walkingMinutes,
      walkingCal,
      cyclingCal,
      co2Driving,
      elevationData,
    }
  }, [route])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-4 p-4">
      {/* Distance */}
      <StatCard
        icon={<Ruler className="h-4 w-4 text-primary" />}
        label={t('analyticsDistance')}
        value={analytics.distanceKm.toFixed(1)}
        suffix=" km"
        color="bg-primary/10 text-primary"
      />

      {/* Duration estimates */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          {t('analyticsDuration')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border/30 bg-background/50 p-2.5 text-center">
            <Car className="h-3.5 w-3.5 mx-auto mb-1 text-sky-500" />
            <p className="text-xs font-bold">{formatDuration(analytics.drivingMinutes)}</p>
            <p className="text-[9px] text-muted-foreground">{t('analyticsDriving')}</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/50 p-2.5 text-center">
            <Bike className="h-3.5 w-3.5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xs font-bold">{formatDuration(analytics.cyclingMinutes)}</p>
            <p className="text-[9px] text-muted-foreground">{t('analyticsCycling')}</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/50 p-2.5 text-center">
            <Footprints className="h-3.5 w-3.5 mx-auto mb-1 text-amber-500" />
            <p className="text-xs font-bold">{formatDuration(analytics.walkingMinutes)}</p>
            <p className="text-[9px] text-muted-foreground">{t('analyticsWalking')}</p>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Elevation profile chart */}
      {analytics.elevationData.length >= 2 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Mountain className="h-3 w-3" />
            {t('analyticsElevation')} Profile
          </p>
          <div className="h-28 rounded-lg border border-border/30 bg-background/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.elevationData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="point" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '4px 8px',
                  }}
                  formatter={(val: number) => [`${Math.round(val)}m`, 'Elev.']}
                />
                <Area
                  type="monotone"
                  dataKey="elevation"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Separator className="opacity-50" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          label={t('analyticsEfficiency')}
          value={analytics.efficiency.toFixed(0)}
          suffix="%"
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          label={t('analyticsCalories')}
          value={analytics.walkingCal.toString()}
          suffix=" cal"
          color="bg-orange-500/10 text-orange-500"
        />
        <StatCard
          icon={<Leaf className="h-4 w-4 text-green-500" />}
          label={t('analyticsCO2')}
          value={analytics.co2Driving.toString()}
          suffix=" g"
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={<Ruler className="h-4 w-4 text-muted-foreground" />}
          label="Distance (mi)"
          value={analytics.distanceMi.toFixed(1)}
          suffix=" mi"
          color="bg-muted/50 text-muted-foreground"
        />
      </div>
    </div>
  )
}

export function RouteAnalyticsPanel({ inline }: { inline?: boolean } = {}) {
  const { t } = useTranslation()
  const routes = useMapStore((s) => s.routes)
  const routePoints = useMapStore((s) => s.routePoints)
  const osrmDistance = useMapStore((s) => s.osrmDistance)

  // Show analytics when there's an active route being built or saved routes
  const hasActiveRoute = routePoints.length >= 2
  const hasSavedRoutes = routes.length > 0

  if (!hasActiveRoute && !hasSavedRoutes) return null

  // Use the most recent saved route, or create a temporary route from current points
  const activeRoute: MapRoute = hasSavedRoutes
    ? routes[routes.length - 1]
    : {
        id: 'temp',
        name: 'Current Route',
        color: '#3b82f6',
        points: routePoints,
        distance: osrmDistance ?? (() => {
          let total = 0
          for (let i = 1; i < routePoints.length; i++) {
            total += haversineDistance(
              routePoints[i - 1].latitude,
              routePoints[i - 1].longitude,
              routePoints[i].latitude,
              routePoints[i].longitude
            )
          }
          return total
        })(),
        duration: null,
      }

  const content = (
    <>
      {!inline && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <Route className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t('analyticsTitle')}</h3>
          <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
            {activeRoute.name}
          </Badge>
        </div>
      )}
      <RouteAnalyticsContent route={activeRoute} />
    </>
  )

  if (inline) {
    return <div>{content}</div>
  }

  return (
    <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg overflow-hidden">
      {content}
    </div>
  )
}
