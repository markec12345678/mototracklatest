'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type LavaTubeState } from '@/lib/map-store'
import { Flame as FlameIcon13, X, MapPin, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS = [
  { name: 'Kilauea', value: 1140, unit: 'tube temperature (°C)', status: 'critical', trend: 'up', lat: 19.4, lng: -155.3, description: 'Active lava tube system with sustained high-temperature flows' },
  { name: 'Mt. Etna', value: 870, unit: 'tube temperature (°C)', status: 'warning', trend: 'up', lat: 37.75, lng: 15, description: 'Lava tube network on Etna flanks showing elevated temperatures' },
  { name: 'Galapagos', value: 620, unit: 'tube temperature (°C)', status: 'warning', trend: 'stable', lat: -0.5, lng: -91, description: 'Moderate tube activity in Galapagos volcanic system' },
  { name: 'Iceland', value: 340, unit: 'tube temperature (°C)', status: 'normal', trend: 'down', lat: 64, lng: -18, description: 'Cooling lava tubes in recent Icelandic eruption sites' },
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

export function LavaTubeMonitor() {
  const data = useMapStore((s) => s.lavaTube.data)
  const setData = useMapStore((s) => s.setLavaTube)

  useEffect(() => {
    if (!data) {
      setData({
        data: {
          name: 'Global Lava Tube Monitor',
          value: 742.5,
          unit: 'avg tube temperature (°C)',
          status: 'warning',
          trend: 'up',
          lat: 19.4,
          lng: -155.3,
          description: 'Monitoring lava tube temperatures and flow dynamics at active volcanic sites',
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
        <Card className="bg-gradient-to-br from-orange-950/95 to-orange-950/80 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg shadow-orange-950/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-orange-800/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
                <FlameIcon13 className="h-4 w-4 text-orange-400" />
                Lava Tube Monitor
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30" onClick={() => setData({ open: false })}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-orange-100">
            {data && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-medium">{data.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${STATUS_COLORS[data.status]?.bg || ''} ${STATUS_COLORS[data.status]?.text || ''} ${STATUS_COLORS[data.status]?.border || ''}`}>
                    {data.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
                    <div className="text-[10px] text-orange-400">Avg Tube Temperature</div>
                    <div className="text-lg font-semibold text-orange-200">{data.value.toFixed(1)}</div>
                    <div className="text-[9px] text-orange-400">{data.unit}</div>
                  </div>
                  <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
                    <div className="text-[10px] text-orange-400">Trend</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendIcon trend={data.trend} />
                      <span className="text-sm font-semibold text-orange-200 capitalize">{data.trend}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-orange-800/30" />

                <ScrollArea className="max-h-[220px]">
                  <div className="space-y-2 pr-1">
                    {SAMPLE_LOCATIONS.map((loc) => {
                      const sc = STATUS_COLORS[loc.status]
                      return (
                        <div key={loc.name} className="rounded-lg border border-orange-800/30 p-2.5 hover:bg-orange-900/20 transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.status === 'critical' ? '#ef4444' : loc.status === 'warning' ? '#f59e0b' : '#22c55e' }} />
                              <span className="text-xs font-medium text-orange-100">{loc.name}</span>
                            </div>
                            <Badge variant="outline" className={`text-[9px] h-4 ${sc?.bg || ''} ${sc?.text || ''} ${sc?.border || ''}`}>
                              {loc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-orange-300">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</span>
                            <span className="ml-auto font-medium text-orange-200">{loc.value} {loc.unit}</span>
                          </div>
                          <p className="text-[10px] text-orange-400 mt-1">{loc.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="text-[10px] text-orange-500 text-right">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
