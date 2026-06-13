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
import { useMapStore, type ViralOutbreakState, type ViralOutbreakZone } from '@/lib/map-store'
import { Bug, X, Activity, TrendingUp, Shield, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_OUTBREAKS: ViralOutbreakZone[] = [
  {
    id: 'vo-dengue',
    name: 'Dengue - SE Asia',
    latitude: 13.76,
    longitude: 100.50,
    pathogen: 'DENV-2',
    caseCount: 45000,
    r0Value: 3.5,
    severity: 'epidemic',
    vaccinationRate: 12,
    mortalityRate: 0.8,
    lastUpdated: '2025-03-04',
  },
  {
    id: 'vo-measles',
    name: 'Measles - DRC',
    latitude: -4.44,
    longitude: 15.27,
    pathogen: 'Measles virus',
    caseCount: 85000,
    r0Value: 14.0,
    severity: 'epidemic',
    vaccinationRate: 58,
    mortalityRate: 2.1,
    lastUpdated: '2025-03-03',
  },
  {
    id: 'vo-covid',
    name: 'COVID-19 Variant - Global',
    latitude: 48.86,
    longitude: 2.35,
    pathogen: 'SARS-CoV-2 XBB.1.5',
    caseCount: 125000,
    r0Value: 8.2,
    severity: 'pandemic',
    vaccinationRate: 72,
    mortalityRate: 0.5,
    lastUpdated: '2025-03-04',
  },
  {
    id: 'vo-cholera',
    name: 'Cholera - Haiti',
    latitude: 18.97,
    longitude: -72.33,
    pathogen: 'Vibrio cholerae',
    caseCount: 5200,
    r0Value: 2.8,
    severity: 'spreading',
    vaccinationRate: 8,
    mortalityRate: 1.2,
    lastUpdated: '2025-03-02',
  },
  {
    id: 'vo-ebola',
    name: 'Ebola - Uganda',
    latitude: 1.37,
    longitude: 32.29,
    pathogen: 'Ebolavirus',
    caseCount: 142,
    r0Value: 1.8,
    severity: 'contained',
    vaccinationRate: 45,
    mortalityRate: 42.0,
    lastUpdated: '2025-03-04',
  },
  {
    id: 'vo-mpox',
    name: 'MPOX - Central Africa',
    latitude: -4.28,
    longitude: 21.75,
    pathogen: 'Monkeypox virus',
    caseCount: 3200,
    r0Value: 2.1,
    severity: 'spreading',
    vaccinationRate: 15,
    mortalityRate: 3.5,
    lastUpdated: '2025-03-01',
  },
]

const SEVERITY_CONFIG: Record<
  ViralOutbreakZone['severity'],
  { label: string; color: string; bgClass: string }
> = {
  contained: { label: 'Contained', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  spreading: { label: 'Spreading', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  epidemic: { label: 'Epidemic', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  pandemic: { label: 'Pandemic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function ViralOutbreakMapper() {
  const viralOutbreak = useMapStore((s) => s.viralOutbreak)
  const setViralOutbreak = useMapStore((s) => s.setViralOutbreak)

  const outbreaks = useMemo(
    () => (viralOutbreak.outbreaks.length > 0 ? viralOutbreak.outbreaks : DEMO_OUTBREAKS),
    [viralOutbreak.outbreaks]
  )

  const filteredOutbreaks = useMemo(() => {
    return outbreaks.filter((o) => {
      if (viralOutbreak.severityFilter !== 'all' && o.severity !== viralOutbreak.severityFilter) return false
      return true
    })
  }, [outbreaks, viralOutbreak.severityFilter])

  const summary = useMemo(() => {
    if (filteredOutbreaks.length === 0) {
      return { totalCases: 0, epidemicPandemicCount: 0, avgVaccinationRate: 0 }
    }
    const totalCases = filteredOutbreaks.reduce((sum, o) => sum + o.caseCount, 0)
    const epidemicPandemicCount = filteredOutbreaks.filter(
      (o) => o.severity === 'epidemic' || o.severity === 'pandemic'
    ).length
    const avgVaccinationRate =
      filteredOutbreaks.reduce((sum, o) => sum + o.vaccinationRate, 0) / filteredOutbreaks.length
    return {
      totalCases,
      epidemicPandemicCount,
      avgVaccinationRate: Math.round(avgVaccinationRate * 10) / 10,
    }
  }, [filteredOutbreaks])

  const activeOutbreak = useMemo(
    () => outbreaks.find((o) => o.id === viralOutbreak.activeOutbreakId) ?? null,
    [outbreaks, viralOutbreak.activeOutbreakId]
  )

  if (typeof window === 'undefined') return null
  if (!viralOutbreak.open) return null

  const overlayToggles: { key: keyof ViralOutbreakState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCaseCount', label: 'Case Count', icon: Activity },
    { key: 'showR0', label: 'R0 Value', icon: TrendingUp },
    { key: 'showVaccination', label: 'Vaccination', icon: Shield },
    { key: 'showMortality', label: 'Mortality', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4 text-red-500" />
              Viral Outbreak Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViralOutbreak({ open: false })}
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
              Outbreak Severity
            </Label>
            <Select
              value={viralOutbreak.severityFilter}
              onValueChange={(v) =>
                setViralOutbreak({
                  severityFilter: v as ViralOutbreakState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
                <SelectItem value="spreading">Spreading</SelectItem>
                <SelectItem value="epidemic">Epidemic</SelectItem>
                <SelectItem value="pandemic">Pandemic</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={viralOutbreak[key] as boolean}
                  onCheckedChange={(checked) => setViralOutbreak({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Cases</div>
              <div className="text-sm font-semibold">{summary.totalCases.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">reported</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Epidemic/Pandemic</div>
              <div className="text-sm font-semibold text-red-500">{summary.epidemicPandemicCount}</div>
              <div className="text-[9px] text-muted-foreground">outbreaks</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Vaccination</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgVaccinationRate}%</div>
              <div className="text-[9px] text-muted-foreground">rate</div>
            </div>
          </div>

          <Separator />

          {/* Outbreak List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Active Outbreaks ({filteredOutbreaks.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredOutbreaks.map((outbreak) => {
                  const isActive = viralOutbreak.activeOutbreakId === outbreak.id
                  const sevCfg = SEVERITY_CONFIG[outbreak.severity]
                  return (
                    <div
                      key={outbreak.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setViralOutbreak({
                          activeOutbreakId: isActive ? null : outbreak.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sevCfg.color }}
                          />
                          <span className="text-xs font-medium">{outbreak.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sevCfg.bgClass}`}
                        >
                          {sevCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {viralOutbreak.showCaseCount && (
                          <div>
                            Cases:{' '}
                            <span className="text-foreground font-medium">
                              {outbreak.caseCount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {viralOutbreak.showR0 && (
                          <div>
                            R0:{' '}
                            <span className="text-foreground font-medium">
                              {outbreak.r0Value}
                            </span>
                          </div>
                        )}
                        {viralOutbreak.showVaccination && (
                          <div>
                            Vacc:{' '}
                            <span className="text-foreground font-medium">
                              {outbreak.vaccinationRate}%
                            </span>
                          </div>
                        )}
                        {viralOutbreak.showMortality && (
                          <div>
                            Mortality:{' '}
                            <span className="text-foreground font-medium">
                              {outbreak.mortalityRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredOutbreaks.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No outbreaks match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Outbreak Details */}
          {activeOutbreak && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-semibold">{activeOutbreak.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeOutbreak.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeOutbreak.severity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeOutbreak.latitude.toFixed(2)}, {activeOutbreak.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pathogen: </span>
                    <span className="font-medium">{activeOutbreak.pathogen}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Case Count: </span>
                    <span className="font-medium">{activeOutbreak.caseCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">R0 Value: </span>
                    <span className="font-medium">{activeOutbreak.r0Value}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vaccination Rate: </span>
                    <span className="font-medium">{activeOutbreak.vaccinationRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mortality Rate: </span>
                    <span className="font-medium">{activeOutbreak.mortalityRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity: </span>
                    <span className="font-medium">{SEVERITY_CONFIG[activeOutbreak.severity].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated: </span>
                    <span className="font-medium">{activeOutbreak.lastUpdated}</span>
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
