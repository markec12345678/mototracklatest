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
import { useMapStore, type NoisePollutionState, type NoisePollutionZone } from '@/lib/map-store'
import { Volume2 as Volume2Icon, X, MapPin, VolumeX, Users, ShieldCheck, Filter } from 'lucide-react'

const DEMO_ZONES: NoisePollutionZone[] = [
  {
    id: 'np-times-square',
    name: 'Times Square',
    latitude: 40.758,
    longitude: -73.9855,
    decibels: 92,
    noiseType: 'mixed',
    timeOfDay: 'evening',
    affectedPopulation: 260000,
    compliance: 'non_compliant',
  },
  {
    id: 'np-heathrow',
    name: 'Heathrow Airport',
    latitude: 51.47,
    longitude: -0.4543,
    decibels: 88,
    noiseType: 'aircraft',
    timeOfDay: 'day',
    affectedPopulation: 780000,
    compliance: 'marginal',
  },
  {
    id: 'np-shibuya',
    name: 'Shibuya Crossing',
    latitude: 35.6595,
    longitude: 139.7004,
    decibels: 86,
    noiseType: 'traffic',
    timeOfDay: 'evening',
    affectedPopulation: 320000,
    compliance: 'marginal',
  },
  {
    id: 'np-autobahn',
    name: 'Autobahn A9 Munich',
    latitude: 48.18,
    longitude: 11.59,
    decibels: 82,
    noiseType: 'traffic',
    timeOfDay: 'day',
    affectedPopulation: 145000,
    compliance: 'compliant',
  },
  {
    id: 'np-shenzhen',
    name: 'Industrial Shenzhen',
    latitude: 22.5431,
    longitude: 114.0579,
    decibels: 95,
    noiseType: 'industrial',
    timeOfDay: 'night',
    affectedPopulation: 420000,
    compliance: 'non_compliant',
  },
  {
    id: 'np-toulouse',
    name: 'Toulouse Airbus Facility',
    latitude: 43.46,
    longitude: 1.37,
    decibels: 84,
    noiseType: 'construction',
    timeOfDay: 'day',
    affectedPopulation: 95000,
    compliance: 'compliant',
  },
]

const NOISE_TYPE_CONFIG: Record<
  NoisePollutionZone['noiseType'],
  { label: string; color: string; bgClass: string }
> = {
  traffic: { label: 'Traffic', color: '#d97706', bgClass: 'bg-amber-600/10 text-amber-700 border-amber-600/30' },
  industrial: { label: 'Industrial', color: '#b45309', bgClass: 'bg-amber-700/10 text-amber-800 border-amber-700/30' },
  construction: { label: 'Construction', color: '#92400e', bgClass: 'bg-amber-800/10 text-amber-900 border-amber-800/30' },
  aircraft: { label: 'Aircraft', color: '#ca8a04', bgClass: 'bg-yellow-600/10 text-yellow-700 border-yellow-600/30' },
  entertainment: { label: 'Entertainment', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
  mixed: { label: 'Mixed', color: '#78350f', bgClass: 'bg-amber-900/10 text-amber-800 border-amber-900/30' },
}

const COMPLIANCE_CONFIG: Record<
  NoisePollutionZone['compliance'],
  { label: string; color: string; bgClass: string }
> = {
  compliant: { label: 'Compliant', color: '#16a34a', bgClass: 'bg-green-600/10 text-green-700 border-green-600/30' },
  marginal: { label: 'Marginal', color: '#ca8a04', bgClass: 'bg-yellow-600/10 text-yellow-700 border-yellow-600/30' },
  non_compliant: { label: 'Non-Compliant', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

const TIME_CONFIG: Record<NoisePollutionZone['timeOfDay'], string> = {
  day: '☀️ Day',
  evening: '🌆 Evening',
  night: '🌙 Night',
}

function getDecibelColor(db: number): string {
  if (db >= 90) return '#dc2626'
  if (db >= 80) return '#ea580c'
  if (db >= 70) return '#eab308'
  return '#22c55e'
}

export function NoisePollutionMapper() {
  const noisePollution = useMapStore((s) => s.noisePollution)
  const setNoisePollution = useMapStore((s) => s.setNoisePollution)

  const zones = useMemo(
    () => (noisePollution.zones.length > 0 ? noisePollution.zones : DEMO_ZONES),
    [noisePollution.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (noisePollution.typeFilter !== 'all' && z.noiseType !== noisePollution.typeFilter) return false
      return true
    })
  }, [zones, noisePollution.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgDecibels: 0, totalAffected: 0, nonCompliantCount: 0 }
    }
    const avgDecibels = Math.round(filteredZones.reduce((sum, z) => sum + z.decibels, 0) / filteredZones.length)
    const totalAffected = filteredZones.reduce((sum, z) => sum + z.affectedPopulation, 0)
    const nonCompliantCount = filteredZones.filter((z) => z.compliance === 'non_compliant').length
    return { avgDecibels, totalAffected, nonCompliantCount }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === noisePollution.activeZoneId) ?? null,
    [zones, noisePollution.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!noisePollution.open) return null

  const overlayToggles: { key: keyof NoisePollutionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDecibels', label: 'Decibels', icon: Volume2Icon },
    { key: 'showNoiseType', label: 'Noise Type', icon: VolumeX },
    { key: 'showAffectedPopulation', label: 'Population', icon: Users },
    { key: 'showCompliance', label: 'Compliance', icon: ShieldCheck },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Volume2Icon className="h-4 w-4 text-yellow-600" />
              Noise Pollution Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setNoisePollution({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Noise Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Noise Type
            </Label>
            <Select
              value={noisePollution.typeFilter}
              onValueChange={(v) =>
                setNoisePollution({
                  typeFilter: v as NoisePollutionState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="aircraft">Aircraft</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
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
                  <Icon className="h-3 w-3 text-yellow-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={noisePollution[key] as boolean}
                  onCheckedChange={(checked) => setNoisePollution({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Decibels</div>
              <div className="text-sm font-semibold" style={{ color: getDecibelColor(summary.avgDecibels) }}>
                {summary.avgDecibels}
              </div>
              <div className="text-[9px] text-muted-foreground">dB(A)</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Affected Pop.</div>
              <div className="text-sm font-semibold text-yellow-600">
                {(summary.totalAffected / 1000).toFixed(0)}K
              </div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Non-Compliant</div>
              <div className="text-sm font-semibold text-red-600">{summary.nonCompliantCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Noise Monitoring Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = noisePollution.activeZoneId === zone.id
                  const typeCfg = NOISE_TYPE_CONFIG[zone.noiseType]
                  const compCfg = COMPLIANCE_CONFIG[zone.compliance]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-yellow-600/50 bg-yellow-600/5'
                          : 'border-border/40 hover:border-yellow-600/20 hover:bg-yellow-600/5'
                      }`}
                      onClick={() =>
                        setNoisePollution({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: typeCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${compCfg.bgClass}`}
                          >
                            {compCfg.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {noisePollution.showDecibels && (
                          <div>
                            Level:{' '}
                            <span className="font-medium" style={{ color: getDecibelColor(zone.decibels) }}>
                              {zone.decibels} dB(A)
                            </span>
                          </div>
                        )}
                        {noisePollution.showNoiseType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {typeCfg.label}
                            </span>
                          </div>
                        )}
                        {noisePollution.showAffectedPopulation && (
                          <div>
                            Pop.:{' '}
                            <span className="text-foreground font-medium">
                              {zone.affectedPopulation.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {noisePollution.showCompliance && (
                          <div>
                            Compliance:{' '}
                            <span className="font-medium" style={{ color: compCfg.color }}>
                              {compCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-yellow-600/20 bg-yellow-600/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${COMPLIANCE_CONFIG[activeZone.compliance].bgClass}`}
                  >
                    {COMPLIANCE_CONFIG[activeZone.compliance].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Decibels: </span>
                    <span className="font-medium" style={{ color: getDecibelColor(activeZone.decibels) }}>
                      {activeZone.decibels} dB(A)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Noise Type: </span>
                    <span className="font-medium">{NOISE_TYPE_CONFIG[activeZone.noiseType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time: </span>
                    <span className="font-medium">{TIME_CONFIG[activeZone.timeOfDay]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Pop.: </span>
                    <span className="font-medium">{activeZone.affectedPopulation.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Compliance: </span>
                    <span className="font-medium" style={{ color: COMPLIANCE_CONFIG[activeZone.compliance].color }}>
                      {COMPLIANCE_CONFIG[activeZone.compliance].label}
                    </span>
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
