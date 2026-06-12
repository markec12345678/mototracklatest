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
import { useMapStore, type ThermoclineState, type ThermoclineProfile } from '@/lib/map-store'
import { Waves, X, Thermometer, Compass, Filter, MapPin } from 'lucide-react'

const DEMO_PROFILES: ThermoclineProfile[] = [
  {
    id: 'tc-equatorial-pacific',
    name: 'Equatorial Pacific',
    latitude: 0.0,
    longitude: -150.0,
    thermoclineDepth: 50,
    gradientStrength: 0.18,
    sstSurface: 28.5,
    sstDeep: 8.2,
    season: 'Winter',
    elNinoPhase: 'el_nino',
  },
  {
    id: 'tc-gulfstream',
    name: 'Gulf Stream',
    latitude: 35.0,
    longitude: -70.0,
    thermoclineDepth: 120,
    gradientStrength: 0.12,
    sstSurface: 24.8,
    sstDeep: 6.5,
    season: 'Winter',
    elNinoPhase: 'neutral',
  },
  {
    id: 'tc-kuroshio',
    name: 'Kuroshio Current',
    latitude: 32.0,
    longitude: 140.0,
    thermoclineDepth: 150,
    gradientStrength: 0.09,
    sstSurface: 22.3,
    sstDeep: 4.1,
    season: 'Winter',
    elNinoPhase: 'la_nina',
  },
  {
    id: 'tc-agulhas',
    name: 'Agulhas Current',
    latitude: -33.0,
    longitude: 28.0,
    thermoclineDepth: 95,
    gradientStrength: 0.15,
    sstSurface: 25.1,
    sstDeep: 5.8,
    season: 'Summer',
    elNinoPhase: 'neutral',
  },
  {
    id: 'tc-benguela',
    name: 'Benguela Upwelling',
    latitude: -22.0,
    longitude: 12.0,
    thermoclineDepth: 35,
    gradientStrength: 0.25,
    sstSurface: 16.4,
    sstDeep: 7.3,
    season: 'Summer',
    elNinoPhase: 'el_nino',
  },
  {
    id: 'tc-norwegian',
    name: 'Norwegian Sea',
    latitude: 65.0,
    longitude: 5.0,
    thermoclineDepth: 200,
    gradientStrength: 0.06,
    sstSurface: 8.9,
    sstDeep: -0.8,
    season: 'Winter',
    elNinoPhase: 'neutral',
  },
]

const ENSO_CONFIG: Record<
  ThermoclineProfile['elNinoPhase'],
  { label: string; color: string; bgClass: string }
> = {
  neutral: { label: 'Neutral', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  el_nino: { label: 'El Niño', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  la_nina: { label: 'La Niña', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

export function ThermoclineMapper() {
  const thermocline = useMapStore((s) => s.thermocline)
  const setThermocline = useMapStore((s) => s.setThermocline)

  const profiles = useMemo(
    () => (thermocline.profiles.length > 0 ? thermocline.profiles : DEMO_PROFILES),
    [thermocline.profiles]
  )

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (thermocline.ensoFilter !== 'all' && p.elNinoPhase !== thermocline.ensoFilter) return false
      return true
    })
  }, [profiles, thermocline.ensoFilter])

  const summary = useMemo(() => {
    if (filteredProfiles.length === 0) {
      return { avgDepth: 0, elNinoCount: 0, maxGradient: 0 }
    }
    const avgDepth =
      filteredProfiles.reduce((sum, p) => sum + p.thermoclineDepth, 0) / filteredProfiles.length
    const elNinoCount = filteredProfiles.filter((p) => p.elNinoPhase === 'el_nino').length
    const maxGradient = Math.max(...filteredProfiles.map((p) => p.gradientStrength))
    return {
      avgDepth: Math.round(avgDepth),
      elNinoCount,
      maxGradient,
    }
  }, [filteredProfiles])

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === thermocline.activeProfileId) ?? null,
    [profiles, thermocline.activeProfileId]
  )

  if (typeof window === 'undefined') return null
  if (!thermocline.open) return null

  const overlayToggles: { key: keyof ThermoclineState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Thermocline Depth', icon: Waves },
    { key: 'showGradient', label: 'Gradient Strength', icon: Compass },
    { key: 'showSST', label: 'SST Data', icon: Thermometer },
    { key: 'showENSO', label: 'ENSO Phase', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-teal-500" />
              Thermocline Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setThermocline({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* ENSO Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              ENSO Phase
            </Label>
            <Select
              value={thermocline.ensoFilter}
              onValueChange={(v) =>
                setThermocline({
                  ensoFilter: v as ThermoclineState['ensoFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="el_nino">El Niño</SelectItem>
                <SelectItem value="la_nina">La Niña</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={thermocline[key] as boolean}
                  onCheckedChange={(checked) => setThermocline({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold">{summary.avgDepth}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">El Niño</div>
              <div className="text-sm font-semibold text-red-500">{summary.elNinoCount}</div>
              <div className="text-[9px] text-muted-foreground">profiles</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Gradient</div>
              <div className="text-sm font-semibold text-teal-500">{summary.maxGradient}</div>
              <div className="text-[9px] text-muted-foreground">°C/m</div>
            </div>
          </div>

          <Separator />

          {/* Profile List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ocean Profiles ({filteredProfiles.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredProfiles.map((profile) => {
                  const isActive = thermocline.activeProfileId === profile.id
                  const ensoCfg = ENSO_CONFIG[profile.elNinoPhase]
                  return (
                    <div
                      key={profile.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setThermocline({
                          activeProfileId: isActive ? null : profile.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: ensoCfg.color }}
                          />
                          <span className="text-xs font-medium">{profile.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${ensoCfg.bgClass}`}
                        >
                          {ensoCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {thermocline.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {profile.thermoclineDepth} m
                            </span>
                          </div>
                        )}
                        {thermocline.showGradient && (
                          <div>
                            Gradient:{' '}
                            <span className="text-foreground font-medium">
                              {profile.gradientStrength} °C/m
                            </span>
                          </div>
                        )}
                        {thermocline.showSST && (
                          <div>
                            SST Surface:{' '}
                            <span className="text-foreground font-medium">
                              {profile.sstSurface} °C
                            </span>
                          </div>
                        )}
                        {thermocline.showENSO && (
                          <div>
                            SST Deep:{' '}
                            <span className="text-foreground font-medium">
                              {profile.sstDeep} °C
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredProfiles.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No profiles match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Profile Details */}
          {activeProfile && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-xs font-semibold">{activeProfile.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ENSO_CONFIG[activeProfile.elNinoPhase].bgClass}`}
                  >
                    {ENSO_CONFIG[activeProfile.elNinoPhase].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeProfile.latitude.toFixed(2)}, {activeProfile.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season: </span>
                    <span className="font-medium">{activeProfile.season}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thermocline Depth: </span>
                    <span className="font-medium">{activeProfile.thermoclineDepth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gradient: </span>
                    <span className="font-medium">{activeProfile.gradientStrength} °C/m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SST Surface: </span>
                    <span className="font-medium">{activeProfile.sstSurface} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SST Deep: </span>
                    <span className="font-medium">{activeProfile.sstDeep} °C</span>
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
