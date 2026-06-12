'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type AuroraForecasterState, type AuroraViewingSite } from '@/lib/map-store'
import { Sparkles, X, Cloud, Star, Filter, MapPin, Eye } from 'lucide-react'

const VISIBILITY_COLORS: Record<AuroraViewingSite['visibility'], string> = {
  excellent: 'bg-green-500/20 text-green-700 border-green-500/40',
  good: 'bg-lime-500/20 text-lime-700 border-lime-500/40',
  fair: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  poor: 'bg-orange-500/20 text-orange-700 border-orange-500/40',
  none: 'bg-red-500/20 text-red-700 border-red-500/40',
}

const VISIBILITY_LABELS: Record<AuroraViewingSite['visibility'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  none: 'None',
}

export default function AuroraForecaster() {
  const auroraForecaster = useMapStore((s) => s.auroraForecaster)
  const setAuroraForecaster = useMapStore((s) => s.setAuroraForecaster)

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  const sampleSites = useMemo<AuroraViewingSite[]>(() => [
    {
      id: 'au1',
      name: 'Tromsø, Norway',
      latitude: 69.6,
      longitude: 19.0,
      kpIndex: 5,
      cloudCover: 15,
      lightPollution: 2,
      visibility: 'excellent',
      predictedIntensity: 8.5,
      bestViewingTime: '21:00 - 01:00 UTC',
    },
    {
      id: 'au2',
      name: 'Abisko, Sweden',
      latitude: 68.35,
      longitude: 18.82,
      kpIndex: 4,
      cloudCover: 20,
      lightPollution: 1,
      visibility: 'excellent',
      predictedIntensity: 7.8,
      bestViewingTime: '20:30 - 00:30 UTC',
    },
    {
      id: 'au3',
      name: 'Fairbanks, Alaska',
      latitude: 64.84,
      longitude: -147.72,
      kpIndex: 4,
      cloudCover: 35,
      lightPollution: 3,
      visibility: 'good',
      predictedIntensity: 7.2,
      bestViewingTime: '10:00 - 14:00 UTC',
    },
    {
      id: 'au4',
      name: 'Reykjavik, Iceland',
      latitude: 64.15,
      longitude: -21.94,
      kpIndex: 3,
      cloudCover: 55,
      lightPollution: 4,
      visibility: 'fair',
      predictedIntensity: 5.4,
      bestViewingTime: '21:00 - 02:00 UTC',
    },
    {
      id: 'au5',
      name: 'Queenstown, New Zealand',
      latitude: -45.03,
      longitude: 168.66,
      kpIndex: 6,
      cloudCover: 40,
      lightPollution: 2,
      visibility: 'good',
      predictedIntensity: 6.8,
      bestViewingTime: '08:00 - 12:00 UTC',
    },
    {
      id: 'au6',
      name: 'Yukon, Canada',
      latitude: 60.72,
      longitude: -135.05,
      kpIndex: 5,
      cloudCover: 25,
      lightPollution: 1,
      visibility: 'excellent',
      predictedIntensity: 8.1,
      bestViewingTime: '09:00 - 13:00 UTC',
    },
    {
      id: 'au7',
      name: 'Rovaniemi, Finland',
      latitude: 66.5,
      longitude: 25.71,
      kpIndex: 3,
      cloudCover: 70,
      lightPollution: 5,
      visibility: 'poor',
      predictedIntensity: 3.2,
      bestViewingTime: '20:00 - 23:00 UTC',
    },
  ], [])

  const auroraSites = auroraForecaster.auroraSites.length > 0 ? auroraForecaster.auroraSites : sampleSites

  const filteredSites = useMemo(() => {
    if (auroraForecaster.visibilityFilter === 'all') return auroraSites
    return auroraSites.filter((s) => s.visibility === auroraForecaster.visibilityFilter)
  }, [auroraSites, auroraForecaster.visibilityFilter])

  const selectedSite = useMemo(
    () => auroraSites.find((s) => s.id === (selectedSiteId ?? auroraForecaster.activeSiteId)) ?? null,
    [auroraSites, selectedSiteId, auroraForecaster.activeSiteId]
  )

  const summaryStats = useMemo(() => {
    const total = auroraSites.length
    const bestSite = auroraSites.reduce((best, s) =>
      s.visibility === 'excellent' && s.predictedIntensity > (best?.predictedIntensity ?? 0) ? s : best
    , auroraSites[0])
    const avgKp = auroraSites.reduce((sum, s) => sum + s.kpIndex, 0) / (total || 1)
    const excellentGoodCount = auroraSites.filter(
      (s) => s.visibility === 'excellent' || s.visibility === 'good'
    ).length
    return { bestSiteName: bestSite?.name ?? 'N/A', avgKp: Math.round(avgKp * 10) / 10, excellentGoodCount }
  }, [auroraSites])

  if (!auroraForecaster.open) return null

  const toggleSetting = <K extends keyof AuroraForecasterState>(key: K) => {
    setAuroraForecaster({ [key]: !auroraForecaster[key] } as Partial<AuroraForecasterState>)
  }

  return (
    <div className="fixed top-16 right-4 z-[60] w-[380px] max-h-[calc(100vh-5rem)] overflow-hidden">
      <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
        {/* Aurora-themed gradient header */}
        <CardHeader className="pb-3 rounded-t-lg bg-gradient-to-r from-purple-600/80 via-green-500/70 to-purple-600/80">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Sparkles className="h-5 w-5" />
              Aurora Forecaster
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setAuroraForecaster({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-green-500/10 p-2 text-center">
              <div className="text-[11px] font-semibold text-green-700 truncate">{summaryStats.bestSiteName}</div>
              <div className="text-[10px] text-muted-foreground">Best Visibility</div>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-2 text-center">
              <div className="text-xl font-bold text-purple-600">{summaryStats.avgKp}</div>
              <div className="text-[10px] text-muted-foreground">Avg Kp Index</div>
            </div>
            <div className="rounded-lg bg-lime-500/10 p-2 text-center">
              <div className="text-xl font-bold text-lime-700">{summaryStats.excellentGoodCount}</div>
              <div className="text-[10px] text-muted-foreground">Excellent/Good</div>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={auroraForecaster.showKpIndex ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showKpIndex')}
            >
              <Star className="mr-1 h-3 w-3" />
              Kp Index
            </Button>
            <Button
              variant={auroraForecaster.showCloudCover ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showCloudCover')}
            >
              <Cloud className="mr-1 h-3 w-3" />
              Cloud Cover
            </Button>
            <Button
              variant={auroraForecaster.showIntensity ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showIntensity')}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Intensity
            </Button>
            <Button
              variant={auroraForecaster.showViewingTime ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showViewingTime')}
            >
              <Eye className="mr-1 h-3 w-3" />
              Viewing Time
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={auroraForecaster.visibilityFilter}
              onValueChange={(val) =>
                setAuroraForecaster({ visibilityFilter: val as AuroraForecasterState['visibilityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Site List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredSites.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                No sites match the current filter.
              </div>
            )}
            {filteredSites.map((site) => (
              <button
                key={site.id}
                className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                  selectedSite?.id === site.id ? 'border-primary bg-muted/40' : 'border-border'
                }`}
                onClick={() => setSelectedSiteId(site.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate mr-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-purple-500" />
                    {site.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${VISIBILITY_COLORS[site.visibility]}`}
                  >
                    {VISIBILITY_LABELS[site.visibility]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {auroraForecaster.showKpIndex && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      Kp {site.kpIndex}
                    </span>
                  )}
                  {auroraForecaster.showCloudCover && (
                    <span className="flex items-center gap-0.5">
                      <Cloud className="h-3 w-3" />
                      {site.cloudCover}%
                    </span>
                  )}
                  <span>Light: {site.lightPollution}</span>
                  {auroraForecaster.showIntensity && (
                    <span className="flex items-center gap-0.5">
                      <Sparkles className="h-3 w-3" />
                      {site.predictedIntensity.toFixed(1)}
                    </span>
                  )}
                </div>
                {auroraForecaster.showViewingTime && (
                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {site.bestViewingTime}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Site Details */}
          {selectedSite && (
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-purple-500" />
                  {selectedSite.name}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${VISIBILITY_COLORS[selectedSite.visibility]}`}
                >
                  {VISIBILITY_LABELS[selectedSite.visibility]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>{' '}
                  <span className="font-medium">{selectedSite.latitude.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>{' '}
                  <span className="font-medium">{selectedSite.longitude.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Kp Index:</span>{' '}
                  <span className="font-medium">{selectedSite.kpIndex}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Cloud:</span>{' '}
                  <span className="font-medium">{selectedSite.cloudCover}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Light Pollution:</span>{' '}
                  <span className="font-medium">{selectedSite.lightPollution}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Intensity:</span>{' '}
                  <span className="font-medium">{selectedSite.predictedIntensity.toFixed(1)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Best Viewing Time:</span>{' '}
                  <span className="font-medium">{selectedSite.bestViewingTime}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
