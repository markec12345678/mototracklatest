'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type AbyssalVentState } from '@/lib/map-store'
import { Flame as FlameIcon14, X, MapPin, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS = [
  { name: 'East Pacific Rise', value: 380, unit: '°C', status: 'critical', trend: 'up', lat: 13, lng: -104, description: 'Black smoker vent field with extreme thermophilic organisms' },
  { name: 'Mid-Atlantic Ridge', value: 365, unit: '°C', status: 'critical', trend: 'stable', lat: 26, lng: -45, description: 'Lost City hydrothermal field with alkaline vents' },
  { name: 'Indian Ocean Ridge', value: 340, unit: '°C', status: 'warning', trend: 'up', lat: -25, lng: 70, description: 'Kairei hydrothermal vent field with mineral deposits' },
  { name: 'Juan de Fuca Ridge', value: 310, unit: '°C', status: 'warning', trend: 'down', lat: 48, lng: -129, description: 'Endeavour vent system with diverse macrofauna' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-400" />
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-emerald-400" />
  return <Minus className="h-3 w-3 text-amber-400" />
}

export function AbyssalVentMonitor() {
  const data = useMapStore((s) => s.abyssalVent.data)
  const setData = useMapStore((s) => s.setAbyssalVent)

  useEffect(() => {
    if (!data) {
      setData({
        data: {
          name: 'Global Abyssal Vent Monitor',
          value: 348.8,
          unit: '°C',
          status: 'critical',
          trend: 'up',
          lat: 13,
          lng: -104,
          description: 'Monitoring deep-sea hydrothermal vent activity at abyssal depths worldwide',
          lastUpdated: new Date().toISOString(),
        },
      })
    }
  }, [data, setData])

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: SAMPLE_LOCATIONS.map((loc) => ({
        type: 'Feature' as const,
        properties: { name: loc.name, status: loc.status, value: loc.value },
        geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      })),
    }),
    []
  )

  if (typeof window === 'undefined') return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[400px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
        <Card className="bg-gradient-to-br from-red-950/95 to-red-950/80 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-red-800/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-red-100">
                <FlameIcon14 className="h-4 w-4 text-red-400" />
                Abyssal Vent Monitor
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30" onClick={() => setData({ open: false })}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-red-100">
            {data && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs font-medium">{data.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${STATUS_COLORS[data.status]?.bg || ''} ${STATUS_COLORS[data.status]?.text || ''} ${STATUS_COLORS[data.status]?.border || ''}`}>
                    {data.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
                    <div className="text-[10px] text-red-400">Avg Vent Temp</div>
                    <div className="text-lg font-semibold text-red-200">{data.value.toFixed(1)}</div>
                    <div className="text-[9px] text-red-400">{data.unit}</div>
                  </div>
                  <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
                    <div className="text-[10px] text-red-400">Trend</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendIcon trend={data.trend} />
                      <span className="text-sm font-semibold text-red-200 capitalize">{data.trend}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-red-800/30" />

                <ScrollArea className="max-h-[220px]">
                  <div className="space-y-2 pr-1">
                    {SAMPLE_LOCATIONS.map((loc) => {
                      const sc = STATUS_COLORS[loc.status]
                      return (
                        <div key={loc.name} className="rounded-lg border border-red-800/30 p-2.5 hover:bg-red-900/20 transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.status === 'critical' ? '#ef4444' : loc.status === 'warning' ? '#f59e0b' : '#22c55e' }} />
                              <span className="text-xs font-medium text-red-100">{loc.name}</span>
                            </div>
                            <Badge variant="outline" className={`text-[9px] h-4 ${sc?.bg || ''} ${sc?.text || ''} ${sc?.border || ''}`}>
                              {loc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-red-300">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</span>
                            <span className="ml-auto font-medium text-red-200">{loc.value} {loc.unit}</span>
                          </div>
                          <p className="text-[10px] text-red-400 mt-1">{loc.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="text-[10px] text-red-500 text-right">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
