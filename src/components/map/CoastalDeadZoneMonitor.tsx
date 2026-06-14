'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type CoastalDeadZoneState } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon2, X, MapPin, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS = [
  { name: 'Gulf of Mexico Dead Zone', value: 2.1, unit: 'dissolved O2 (mg/L)', status: 'critical', trend: 'up', lat: 29, lng: -90, description: 'Largest seasonal hypoxic zone in US coastal waters, agricultural runoff driven' },
  { name: 'Baltic Sea', value: 3.4, unit: 'dissolved O2 (mg/L)', status: 'warning', trend: 'up', lat: 58, lng: 20, description: 'Persistent hypoxia exacerbated by eutrophication and stratification' },
  { name: 'Chesapeake Bay', value: 4.2, unit: 'dissolved O2 (mg/L)', status: 'warning', trend: 'stable', lat: 37, lng: -76, description: 'Seasonal hypoxia from nutrient pollution, summer anoxic events' },
  { name: 'East China Sea', value: 5.8, unit: 'dissolved O2 (mg/L)', status: 'normal', trend: 'down', lat: 31, lng: 122, description: 'Improving conditions with reduced industrial discharge' },
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

export function CoastalDeadZoneMonitor() {
  const data = useMapStore((s) => s.coastalDeadZone.data)
  const setData = useMapStore((s) => s.setCoastalDeadZone)

  useEffect(() => {
    if (!data) {
      setData({
        data: {
          name: 'Global Coastal Dead Zone Monitor',
          value: 3.9,
          unit: 'avg dissolved O2 (mg/L)',
          status: 'warning',
          trend: 'up',
          lat: 29,
          lng: -90,
          description: 'Monitoring coastal hypoxic zones and dissolved oxygen depletion worldwide',
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
        <Card className="bg-gradient-to-br from-purple-950/95 to-purple-950/80 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-lg shadow-purple-950/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-purple-800/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
                <AlertTriangleIcon2 className="h-4 w-4 text-purple-400" />
                Coastal Dead Zone Monitor
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-300 hover:text-purple-100 hover:bg-purple-800/30" onClick={() => setData({ open: false })}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-purple-100">
            {data && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-medium">{data.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${STATUS_COLORS[data.status]?.bg || ''} ${STATUS_COLORS[data.status]?.text || ''} ${STATUS_COLORS[data.status]?.border || ''}`}>
                    {data.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
                    <div className="text-[10px] text-purple-400">Dissolved O2 (mg/L)</div>
                    <div className="text-lg font-semibold text-purple-200">{data.value.toFixed(1)}</div>
                    <div className="text-[9px] text-purple-400">{data.unit}</div>
                  </div>
                  <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
                    <div className="text-[10px] text-purple-400">Trend</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendIcon trend={data.trend} />
                      <span className="text-sm font-semibold text-purple-200 capitalize">{data.trend}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-purple-800/30" />

                <ScrollArea className="max-h-[220px]">
                  <div className="space-y-2 pr-1">
                    {SAMPLE_LOCATIONS.map((loc) => {
                      const sc = STATUS_COLORS[loc.status]
                      return (
                        <div key={loc.name} className="rounded-lg border border-purple-800/30 p-2.5 hover:bg-purple-900/20 transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.status === 'critical' ? '#ef4444' : loc.status === 'warning' ? '#f59e0b' : '#22c55e' }} />
                              <span className="text-xs font-medium text-purple-100">{loc.name}</span>
                            </div>
                            <Badge variant="outline" className={`text-[9px] h-4 ${sc?.bg || ''} ${sc?.text || ''} ${sc?.border || ''}`}>
                              {loc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-purple-300">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</span>
                            <span className="ml-auto font-medium text-purple-200">{loc.value} {loc.unit}</span>
                          </div>
                          <p className="text-[10px] text-purple-400 mt-1">{loc.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="text-[10px] text-purple-500 text-right">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
