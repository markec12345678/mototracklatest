'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type BioluminescenceState, type BioluminescenceSite } from '@/lib/map-store'
import { Sparkles as SparklesIcon2, X, Fish, Thermometer, Calendar, Filter, MapPin } from 'lucide-react'

const DEMO_SITES: BioluminescenceSite[] = [
  {
    id: 'bio-mosquito',
    name: 'Mosquito Bay',
    latitude: 18.11,
    longitude: -65.47,
    intensity: 'spectacular',
    organismType: 'Dinoflagellates',
    waterTemp: 27,
    lastObserved: '2025-03-01',
    area: 12,
    seasonalPeak: 'Dec-Feb',
  },
  {
    id: 'bio-toyama',
    name: 'Toyama Bay',
    latitude: 36.75,
    longitude: 137.23,
    intensity: 'bright',
    organismType: 'Firefly Squid',
    waterTemp: 14,
    lastObserved: '2025-02-28',
    area: 8,
    seasonalPeak: 'Mar-May',
  },
  {
    id: 'bio-jervis',
    name: 'Jervis Bay',
    latitude: -35.14,
    longitude: 150.68,
    intensity: 'moderate',
    organismType: 'Noctiluca scintillans',
    waterTemp: 21,
    lastObserved: '2025-03-03',
    area: 15,
    seasonalPeak: 'Jun-Aug',
  },
  {
    id: 'bio-maldives',
    name: 'Maldives Beach',
    latitude: 4.17,
    longitude: 73.51,
    intensity: 'spectacular',
    organismType: 'Ostracods',
    waterTemp: 29,
    lastObserved: '2025-03-02',
    area: 6,
    seasonalPeak: 'Year-round',
  },
  {
    id: 'bio-halong',
    name: 'Halong Bay',
    latitude: 20.91,
    longitude: 107.18,
    intensity: 'bright',
    organismType: 'Dinoflagellates',
    waterTemp: 25,
    lastObserved: '2025-02-25',
    area: 10,
    seasonalPeak: 'Nov-Jan',
  },
  {
    id: 'bio-vaadhoo',
    name: 'Vaadhoo Island',
    latitude: 5.28,
    longitude: 72.78,
    intensity: 'spectacular',
    organismType: 'Dinoflagellates',
    waterTemp: 28,
    lastObserved: '2025-03-04',
    area: 4,
    seasonalPeak: 'Jul-Dec',
  },
]

const INTENSITY_CONFIG: Record<
  BioluminescenceSite['intensity'],
  { label: string; color: string; bgClass: string }
> = {
  dim: { label: 'Dim', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  bright: { label: 'Bright', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  spectacular: { label: 'Spectacular', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-500 border-violet-500/30' },
}

export function BioluminescenceTracker() {
  const bioluminescence = useMapStore((s) => s.bioluminescence)
  const setBioluminescence = useMapStore((s) => s.setBioluminescence)

  const sites = useMemo(
    () => (bioluminescence.sites.length > 0 ? bioluminescence.sites : DEMO_SITES),
    [bioluminescence.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (bioluminescence.intensityFilter !== 'all' && s.intensity !== bioluminescence.intensityFilter) return false
      return true
    })
  }, [sites, bioluminescence.intensityFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { spectacularBrightCount: 0, avgWaterTemp: 0, totalArea: 0 }
    }
    const spectacularBrightCount = filteredSites.filter(
      (s) => s.intensity === 'spectacular' || s.intensity === 'bright'
    ).length
    const avgWaterTemp =
      filteredSites.reduce((sum, s) => sum + s.waterTemp, 0) / filteredSites.length
    const totalArea = filteredSites.reduce((sum, s) => sum + s.area, 0)
    return { spectacularBrightCount, avgWaterTemp: Math.round(avgWaterTemp * 10) / 10, totalArea }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === bioluminescence.activeSiteId) ?? null,
    [sites, bioluminescence.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!bioluminescence.open) return null

  const overlayToggles: { key: keyof BioluminescenceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIntensity', label: 'Intensity', icon: SparklesIcon2 },
    { key: 'showOrganismType', label: 'Organism', icon: Fish },
    { key: 'showWaterTemp', label: 'Water Temp', icon: Thermometer },
    { key: 'showSeasonalPeak', label: 'Seasonal Peak', icon: Calendar },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SparklesIcon2 className="h-4 w-4 text-cyan-500" />
              Bioluminescence Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setBioluminescence({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Intensity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Intensity
            </Label>
            <Select
              value={bioluminescence.intensityFilter}
              onValueChange={(v) =>
                setBioluminescence({
                  intensityFilter: v as BioluminescenceState['intensityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="dim">Dim</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="bright">Bright</SelectItem>
                <SelectItem value="spectacular">Spectacular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={bioluminescence[key] as boolean}
                  onCheckedChange={(checked) => setBioluminescence({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Spectacular/Bright</div>
              <div className="text-sm font-semibold text-violet-500">{summary.spectacularBrightCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Water Temp</div>
              <div className="text-sm font-semibold">{summary.avgWaterTemp}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold text-cyan-500">{summary.totalArea}</div>
              <div className="text-[9px] text-muted-foreground">km²</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Bioluminescence Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = bioluminescence.activeSiteId === site.id
                  const intensityCfg = INTENSITY_CONFIG[site.intensity]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setBioluminescence({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: intensityCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${intensityCfg.bgClass}`}
                        >
                          {intensityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {bioluminescence.showIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {intensityCfg.label}
                            </span>
                          </div>
                        )}
                        {bioluminescence.showOrganismType && (
                          <div>
                            Organism:{' '}
                            <span className="text-foreground font-medium">
                              {site.organismType}
                            </span>
                          </div>
                        )}
                        {bioluminescence.showWaterTemp && (
                          <div>
                            Water Temp:{' '}
                            <span className="text-foreground font-medium">
                              {site.waterTemp}°C
                            </span>
                          </div>
                        )}
                        {bioluminescence.showSeasonalPeak && (
                          <div>
                            Peak:{' '}
                            <span className="text-foreground font-medium">
                              {site.seasonalPeak}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${INTENSITY_CONFIG[activeSite.intensity].bgClass}`}
                  >
                    {INTENSITY_CONFIG[activeSite.intensity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSite.latitude.toFixed(2)}, {activeSite.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intensity: </span>
                    <span className="font-medium">{INTENSITY_CONFIG[activeSite.intensity].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organism: </span>
                    <span className="font-medium">{activeSite.organismType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Temp: </span>
                    <span className="font-medium">{activeSite.waterTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Observed: </span>
                    <span className="font-medium">{activeSite.lastObserved}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeSite.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seasonal Peak: </span>
                    <span className="font-medium">{activeSite.seasonalPeak}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
