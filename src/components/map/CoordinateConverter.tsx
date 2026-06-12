'use client'

import { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Navigation, MapPin, ArrowRightLeft } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

type CoordFormat = 'dd' | 'dms' | 'utm'

// DD to DMS conversion
function ddToDms(dd: number, isLat: boolean): string {
  const absolute = Math.abs(dd)
  const degrees = Math.floor(absolute)
  const minutesDecimal = (absolute - degrees) * 60
  const minutes = Math.floor(minutesDecimal)
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(2)
  const direction = isLat
    ? dd >= 0 ? 'N' : 'S'
    : dd >= 0 ? 'E' : 'W'
  return `${degrees}°${minutes}'${seconds}"${direction}`
}

// DD to UTM conversion
function ddToUtm(lat: number, lng: number): { zone: number; letter: string; easting: number; northing: number } {
  const latRad = (lat * Math.PI) / 180
  let zoneNumber = Math.floor((lng + 180) / 6) + 1

  // Special zones for Norway/Svalbard
  if (lat >= 56 && lat < 64 && lng >= 3 && lng < 12) zoneNumber = 32
  if (lat >= 72 && lat < 84) {
    if (lng >= 0 && lng < 9) zoneNumber = 31
    else if (lng >= 9 && lng < 21) zoneNumber = 33
    else if (lng >= 21 && lng < 33) zoneNumber = 35
    else if (lng >= 33 && lng < 42) zoneNumber = 37
  }

  const a = 6378137.0
  const f = 1 / 298.257223563
  const e = Math.sqrt(2 * f - f * f)
  const e2 = e * e / (1 - e * e)
  const k0 = 0.9996

  const lngRad = ((lng - (zoneNumber * 6 - 183)) * Math.PI) / 180

  const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad))
  const T = Math.tan(latRad) * Math.tan(latRad)
  const C = e2 * Math.cos(latRad) * Math.cos(latRad)
  const A = Math.cos(latRad) * lngRad

  const M = a * (
    (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * Math.pow(e, 6) / 256) * latRad
    - (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * Math.pow(e, 6) / 1024) * Math.sin(2 * latRad)
    + (15 * e * e * e * e / 256 + 45 * Math.pow(e, 6) / 1024) * Math.sin(4 * latRad)
    - (35 * Math.pow(e, 6) / 3072) * Math.sin(6 * latRad)
  )

  const easting = k0 * N * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120) + 500000.0
  let northing = k0 * (M + N * Math.tan(latRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720))

  if (lat < 0) northing += 10000000.0

  const letter = lat >= 72 ? 'X' : lat >= 64 ? 'W' : lat >= 56 ? 'V' : lat >= 48 ? 'U' : lat >= 40 ? 'T' : lat >= 32 ? 'S' : lat >= 24 ? 'R' : lat >= 16 ? 'Q' : lat >= 8 ? 'P' : lat >= 0 ? 'N' : lat >= -8 ? 'M' : lat >= -16 ? 'L' : lat >= -24 ? 'K' : lat >= -32 ? 'J' : lat >= -40 ? 'H' : lat >= -48 ? 'G' : lat >= -56 ? 'F' : lat >= -64 ? 'E' : lat >= -72 ? 'D' : 'C'

  return { zone: zoneNumber, letter, easting: Math.round(easting), northing: Math.round(northing) }
}

export function CoordinateConverter() {
  const center = useMapStore((s) => s.center)
  const [inputLat, setInputLat] = useState(center[1].toString())
  const [inputLng, setInputLng] = useState(center[0].toString())
  const [activeTab, setActiveTab] = useState<CoordFormat>('dd')

  const lat = parseFloat(inputLat) || 0
  const lng = parseFloat(inputLng) || 0

  const dmsLat = useMemo(() => ddToDms(lat, true), [lat])
  const dmsLng = useMemo(() => ddToDms(lng, false), [lng])
  const utm = useMemo(() => ddToUtm(lat, lng), [lat, lng])

  const handleUseMapCenter = useCallback(() => {
    const currentCenter = useMapStore.getState().center
    setInputLat(currentCenter[1].toString())
    setInputLng(currentCenter[0].toString())
    toast.success('Using current map center')
  }, [])

  const handleCopy = useCallback((text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    }
  }, [])

  const ddString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  const dmsString = `${dmsLat} ${dmsLng}`
  const utmString = `${utm.zone}${utm.letter} ${utm.easting} ${utm.northing}`

  return (
    <div className="p-3 rounded-xl bg-muted/50 border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Coordinate Converter</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
          onClick={handleUseMapCenter}
        >
          <MapPin className="h-3 w-3" />
          Use Map Center
        </Button>
      </div>

      {/* Input */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Latitude</Label>
          <Input
            type="number"
            step="any"
            value={inputLat}
            onChange={(e) => setInputLat(e.target.value)}
            className="h-7 text-xs"
            placeholder="46.0569"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Longitude</Label>
          <Input
            type="number"
            step="any"
            value={inputLng}
            onChange={(e) => setInputLng(e.target.value)}
            className="h-7 text-xs"
            placeholder="14.5058"
          />
        </div>
      </div>

      {/* Format tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CoordFormat)}>
        <TabsList className="grid w-full grid-cols-3 h-7">
          <TabsTrigger value="dd" className="text-[10px]">DD</TabsTrigger>
          <TabsTrigger value="dms" className="text-[10px]">DMS</TabsTrigger>
          <TabsTrigger value="utm" className="text-[10px]">UTM</TabsTrigger>
        </TabsList>

        <TabsContent value="dd" className="mt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background border">
            <code className="text-xs font-mono flex-1">{ddString}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => handleCopy(ddString, 'DD coordinates')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="dms" className="mt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background border">
            <code className="text-xs font-mono flex-1">{dmsString}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => handleCopy(dmsString, 'DMS coordinates')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="utm" className="mt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-background border">
            <code className="text-xs font-mono flex-1">{utmString}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => handleCopy(utmString, 'UTM coordinates')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick format badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className="text-[9px] h-5 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCopy(ddString, 'DD')}
        >
          DD: {lat.toFixed(4)}, {lng.toFixed(4)}
        </Badge>
        <Badge
          variant="outline"
          className="text-[9px] h-5 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCopy(dmsString, 'DMS')}
        >
          DMS: {dmsLat}
        </Badge>
        <Badge
          variant="outline"
          className="text-[9px] h-5 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleCopy(utmString, 'UTM')}
        >
          UTM: {utm.zone}{utm.letter}
        </Badge>
      </div>
    </div>
  )
}
