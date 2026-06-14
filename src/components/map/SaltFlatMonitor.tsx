'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type SaltFlatState } from '@/lib/map-store'
import { Sun as SunIcon8, X, MapPin, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS = [
  { name: 'Salar de Uyuni', value: 92, unit: '% purity', status: 'normal', trend: 'stable', lat: -20.134, lng: -67.487, description: 'World\'s largest salt flat, 10,582 km² of pristine salt crust' },
  { name: 'Bonneville Salt Flats', value: 55, unit: '% purity', status: 'warning', trend: 'down', lat: 40.796, lng: -113.865, description: 'Racing salt flats experiencing significant shrinkage' },
  { name: 'Atacama Salt Flat', value: 78, unit: '% purity', status: 'normal', trend: 'stable', lat: -23.496, lng: -68.206, description: 'Major lithium-rich salar in the Atacama Desert' },
  { name: 'Dead Sea Salt Flats', value: 45, unit: '% purity', status: 'critical', trend: 'down', lat: 31.5, lng: 35.5, description: 'Rapidly receding shoreline exposing salt formations' },
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

export function SaltFlatMonitor() {
  const data = useMapStore((s) => s.saltFlat.data)
  const setData = useMapStore((s) => s.setSaltFlat)

  useEffect(() => {
    if (!data) {
      setData({
        data: {
          name: 'Global Salt Flat Monitor',
          value: 67.5,
          unit: 'avg purity %',
          status: 'warning',
          trend: 'down',
          lat: -20.134,
          lng: -67.487,
          description: 'Monitoring salt flats and salars for ecological and mineral changes',
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
        <Card className="bg-gradient-to-br from-yellow-950/95 to-yellow-950/80 backdrop-blur-xl border border-yellow-800/40 rounded-xl shadow-lg shadow-yellow-950/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-yellow-800/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-100">
                <SunIcon8 className="h-4 w-4 text-yellow-400" />
                Salt Flat Monitor
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30" onClick={() => setData({ open: false })}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-yellow-100">
            {data && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-xs font-medium">{data.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${STATUS_COLORS[data.status]?.bg || ''} ${STATUS_COLORS[data.status]?.text || ''} ${STATUS_COLORS[data.status]?.border || ''}`}>
                    {data.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
                    <div className="text-[10px] text-yellow-400">Avg Purity</div>
                    <div className="text-lg font-semibold text-yellow-200">{data.value.toFixed(1)}</div>
                    <div className="text-[9px] text-yellow-400">{data.unit}</div>
                  </div>
                  <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
                    <div className="text-[10px] text-yellow-400">Trend</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendIcon trend={data.trend} />
                      <span className="text-sm font-semibold text-yellow-200 capitalize">{data.trend}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-yellow-800/30" />

                <ScrollArea className="max-h-[220px]">
                  <div className="space-y-2 pr-1">
                    {SAMPLE_LOCATIONS.map((loc) => {
                      const sc = STATUS_COLORS[loc.status]
                      return (
                        <div key={loc.name} className="rounded-lg border border-yellow-800/30 p-2.5 hover:bg-yellow-900/20 transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.status === 'critical' ? '#ef4444' : loc.status === 'warning' ? '#f59e0b' : '#22c55e' }} />
                              <span className="text-xs font-medium text-yellow-100">{loc.name}</span>
                            </div>
                            <Badge variant="outline" className={`text-[9px] h-4 ${sc?.bg || ''} ${sc?.text || ''} ${sc?.border || ''}`}>
                              {loc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-yellow-300">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</span>
                            <span className="ml-auto font-medium text-yellow-200">{loc.value} {loc.unit}</span>
                          </div>
                          <p className="text-[10px] text-yellow-400 mt-1">{loc.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="text-[10px] text-yellow-500 text-right">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
