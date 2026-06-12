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
import { useMapStore, type DustStormState, type DustStormEvent } from '@/lib/map-store'
import { Wind as WindIcon2, X, AlertTriangle, Eye, Activity, Filter, MapPin } from 'lucide-react'

const DEMO_STORMS: DustStormEvent[] = [
  {
    id: 'ds-sahara',
    name: 'Sahara Major',
    latitude: 23.42,
    longitude: 12.57,
    severity: 'extreme',
    windSpeed: 95,
    visibility: 0.2,
    dustConcentration: 12000,
    direction: 225,
    area: 450000,
    origin: 'Bodélé Depression',
    duration: '3 days',
  },
  {
    id: 'ds-gobi',
    name: 'Gobi Dust',
    latitude: 43.01,
    longitude: 105.32,
    severity: 'major',
    windSpeed: 72,
    visibility: 0.8,
    dustConcentration: 8500,
    direction: 180,
    area: 280000,
    origin: 'Gobi Desert',
    duration: '2 days',
  },
  {
    id: 'ds-arabian',
    name: 'Arabian Peninsula',
    latitude: 22.15,
    longitude: 45.73,
    severity: 'moderate',
    windSpeed: 55,
    visibility: 2.1,
    dustConcentration: 4200,
    direction: 315,
    area: 150000,
    origin: "Rub' al Khali",
    duration: '1 day',
  },
  {
    id: 'ds-australian',
    name: 'Australian Outback',
    latitude: -25.34,
    longitude: 131.04,
    severity: 'minor',
    windSpeed: 38,
    visibility: 5.5,
    dustConcentration: 1800,
    direction: 90,
    area: 85000,
    origin: 'Lake Eyre Basin',
    duration: '12 hours',
  },
  {
    id: 'ds-taklamakan',
    name: 'Taklamakan',
    latitude: 39.78,
    longitude: 82.43,
    severity: 'moderate',
    windSpeed: 60,
    visibility: 1.5,
    dustConcentration: 5500,
    direction: 270,
    area: 180000,
    origin: 'Taklamakan Desert',
    duration: '1.5 days',
  },
  {
    id: 'ds-sahel',
    name: 'Sahel Zone',
    latitude: 15.22,
    longitude: -5.67,
    severity: 'major',
    windSpeed: 68,
    visibility: 0.5,
    dustConcentration: 7800,
    direction: 200,
    area: 220000,
    origin: 'Sahel Belt',
    duration: '4 days',
  },
]

const SEVERITY_CONFIG: Record<
  DustStormEvent['severity'],
  { label: string; color: string; bgClass: string }
> = {
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  major: { label: 'Major', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function DustStormTracker() {
  const dustStorm = useMapStore((s) => s.dustStorm)
  const setDustStorm = useMapStore((s) => s.setDustStorm)

  const storms = useMemo(
    () => (dustStorm.storms.length > 0 ? dustStorm.storms : DEMO_STORMS),
    [dustStorm.storms]
  )

  const filteredStorms = useMemo(() => {
    return storms.filter((s) => {
      if (dustStorm.severityFilter !== 'all' && s.severity !== dustStorm.severityFilter) return false
      return true
    })
  }, [storms, dustStorm.severityFilter])

  const summary = useMemo(() => {
    if (filteredStorms.length === 0) {
      return { avgWindSpeed: 0, extremeMajorCount: 0, maxDustConcentration: 0 }
    }
    const avgWindSpeed =
      filteredStorms.reduce((sum, s) => sum + s.windSpeed, 0) / filteredStorms.length
    const extremeMajorCount = filteredStorms.filter(
      (s) => s.severity === 'extreme' || s.severity === 'major'
    ).length
    const maxDustConcentration = Math.max(...filteredStorms.map((s) => s.dustConcentration))
    return { avgWindSpeed: Math.round(avgWindSpeed * 10) / 10, extremeMajorCount, maxDustConcentration }
  }, [filteredStorms])

  const activeStorm = useMemo(
    () => storms.find((s) => s.id === dustStorm.activeStormId) ?? null,
    [storms, dustStorm.activeStormId]
  )

  if (typeof window === 'undefined') return null
  if (!dustStorm.open) return null

  const overlayToggles: { key: keyof DustStormState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSeverity', label: 'Severity', icon: AlertTriangle },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: WindIcon2 },
    { key: 'showVisibility', label: 'Visibility', icon: Eye },
    { key: 'showConcentration', label: 'Concentration', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon2 className="h-4 w-4 text-amber-500" />
              Dust Storm Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDustStorm({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity
            </Label>
            <Select
              value={dustStorm.severityFilter}
              onValueChange={(v) =>
                setDustStorm({
                  severityFilter: v as DustStormState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={dustStorm[key] as boolean}
                  onCheckedChange={(checked) => setDustStorm({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Wind Speed</div>
              <div className="text-sm font-semibold">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/h</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Extreme/Major</div>
              <div className="text-sm font-semibold text-red-500">{summary.extremeMajorCount}</div>
              <div className="text-[9px] text-muted-foreground">storms</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Dust</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxDustConcentration}</div>
              <div className="text-[9px] text-muted-foreground">µg/m³</div>
            </div>
          </div>

          <Separator />

          {/* Storm List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Dust Storms ({filteredStorms.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStorms.map((storm) => {
                  const isActive = dustStorm.activeStormId === storm.id
                  const severityCfg = SEVERITY_CONFIG[storm.severity]
                  return (
                    <div
                      key={storm.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setDustStorm({
                          activeStormId: isActive ? null : storm.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: severityCfg.color }}
                          />
                          <span className="text-xs font-medium">{storm.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${severityCfg.bgClass}`}
                        >
                          {severityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {dustStorm.showSeverity && (
                          <div>
                            Severity:{' '}
                            <span className="text-foreground font-medium">
                              {severityCfg.label}
                            </span>
                          </div>
                        )}
                        {dustStorm.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {storm.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {dustStorm.showVisibility && (
                          <div>
                            Visibility:{' '}
                            <span className="text-foreground font-medium">
                              {storm.visibility} km
                            </span>
                          </div>
                        )}
                        {dustStorm.showConcentration && (
                          <div>
                            Dust:{' '}
                            <span className="text-foreground font-medium">
                              {storm.dustConcentration} µg/m³
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStorms.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No storms match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Storm Details */}
          {activeStorm && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeStorm.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeStorm.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeStorm.severity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeStorm.latitude.toFixed(2)}, {activeStorm.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeStorm.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibility: </span>
                    <span className="font-medium">{activeStorm.visibility} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dust Concentration: </span>
                    <span className="font-medium">{activeStorm.dustConcentration} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Direction: </span>
                    <span className="font-medium">{activeStorm.direction}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeStorm.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Origin: </span>
                    <span className="font-medium">{activeStorm.origin}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{activeStorm.duration}</span>
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
