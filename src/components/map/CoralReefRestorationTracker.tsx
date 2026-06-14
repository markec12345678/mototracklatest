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
import { useMapStore, type CoralRestorationState, type CoralRestoration } from '@/lib/map-store'
import { Fish as FishIcon4, X, HeartPulse, Grid3X3, Activity, Wrench, MapPin, Filter } from 'lucide-react'

const DEMO_PROJECTS: CoralRestoration[] = [
  {
    id: 'cr-gbr',
    name: 'Great Barrier Reef Nursery',
    latitude: -18.29,
    longitude: 147.70,
    technique: 'nursery',
    areaRestored: 125,
    speciesCount: 28,
    survivalRate: 87,
    yearsActive: 8,
    healthStatus: 'thriving',
    fundingSource: 'government',
  },
  {
    id: 'cr-caribbean',
    name: 'Caribbean Micro-Fragmentation',
    latitude: 18.00,
    longitude: -63.05,
    technique: 'micro_fragmentation',
    areaRestored: 45,
    speciesCount: 15,
    survivalRate: 92,
    yearsActive: 5,
    healthStatus: 'thriving',
    fundingSource: 'ngo',
  },
  {
    id: 'cr-maldives',
    name: 'Maldives Biorock Program',
    latitude: 3.20,
    longitude: 73.22,
    technique: 'biorock',
    areaRestored: 30,
    speciesCount: 12,
    survivalRate: 78,
    yearsActive: 10,
    healthStatus: 'recovering',
    fundingSource: 'private',
  },
  {
    id: 'cr-seychelles',
    name: 'Seychelles Larval Seeding',
    latitude: -4.68,
    longitude: 55.49,
    technique: 'larval_seeding',
    areaRestored: 60,
    speciesCount: 20,
    survivalRate: 65,
    yearsActive: 3,
    healthStatus: 'stable',
    fundingSource: 'research',
  },
  {
    id: 'cr-florida',
    name: 'Florida Keys Transplant',
    latitude: 24.71,
    longitude: -81.10,
    technique: 'transplant',
    areaRestored: 85,
    speciesCount: 22,
    survivalRate: 72,
    yearsActive: 12,
    healthStatus: 'declining',
    fundingSource: 'mixed',
  },
  {
    id: 'cr-okinawa',
    name: 'Okinawa 3D Printing Reef',
    latitude: 26.33,
    longitude: 127.77,
    technique: '3d_printing',
    areaRestored: 18,
    speciesCount: 8,
    survivalRate: 81,
    yearsActive: 2,
    healthStatus: 'recovering',
    fundingSource: 'research',
  },
]

const HEALTH_STATUS_CONFIG: Record<
  CoralRestoration['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  thriving: { label: 'Thriving', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  recovering: { label: 'Recovering', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  stable: { label: 'Stable', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  declining: { label: 'Declining', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TECHNIQUE_LABELS: Record<CoralRestoration['technique'], string> = {
  nursery: 'Nursery',
  transplant: 'Transplant',
  micro_fragmentation: 'Micro-Fragmentation',
  larval_seeding: 'Larval Seeding',
  biorock: 'Biorock',
  '3d_printing': '3D Printing',
}

export function CoralReefRestorationTracker() {
  const coralRestoration = useMapStore((s) => s.coralRestoration)
  const setCoralRestoration = useMapStore((s) => s.setCoralRestoration)

  const projects = useMemo(
    () => (coralRestoration.projects.length > 0 ? coralRestoration.projects : DEMO_PROJECTS),
    [coralRestoration.projects]
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (coralRestoration.techniqueFilter !== 'all' && p.technique !== coralRestoration.techniqueFilter) return false
      return true
    })
  }, [projects, coralRestoration.techniqueFilter])

  const summary = useMemo(() => {
    if (filteredProjects.length === 0) {
      return { avgSurvivalRate: 0, totalAreaRestored: 0, thrivingCount: 0 }
    }
    const avgSurvivalRate = filteredProjects.reduce((sum, p) => sum + p.survivalRate, 0) / filteredProjects.length
    const totalAreaRestored = filteredProjects.reduce((sum, p) => sum + p.areaRestored, 0)
    const thrivingCount = filteredProjects.filter((p) => p.healthStatus === 'thriving').length
    return {
      avgSurvivalRate: Math.round(avgSurvivalRate * 10) / 10,
      totalAreaRestored,
      thrivingCount,
    }
  }, [filteredProjects])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === coralRestoration.activeProjectId) ?? null,
    [projects, coralRestoration.activeProjectId]
  )

  if (typeof window === 'undefined') return null
  if (!coralRestoration.open) return null

  const overlayToggles: { key: keyof CoralRestorationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurvivalRate', label: 'Survival Rate', icon: HeartPulse },
    { key: 'showAreaRestored', label: 'Area Restored', icon: Grid3X3 },
    { key: 'showHealthStatus', label: 'Health Status', icon: Activity },
    { key: 'showTechnique', label: 'Technique', icon: Wrench },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FishIcon4 className="h-4 w-4 text-cyan-500" />
              Coral Reef Restoration Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCoralRestoration({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Technique Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Technique
            </Label>
            <Select
              value={coralRestoration.techniqueFilter}
              onValueChange={(v) =>
                setCoralRestoration({
                  techniqueFilter: v as CoralRestorationState['techniqueFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Techniques</SelectItem>
                <SelectItem value="nursery">Nursery</SelectItem>
                <SelectItem value="transplant">Transplant</SelectItem>
                <SelectItem value="micro_fragmentation">Micro-Fragmentation</SelectItem>
                <SelectItem value="larval_seeding">Larval Seeding</SelectItem>
                <SelectItem value="biorock">Biorock</SelectItem>
                <SelectItem value="3d_printing">3D Printing</SelectItem>
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
                  checked={coralRestoration[key] as boolean}
                  onCheckedChange={(checked) => setCoralRestoration({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Survival</div>
              <div className="text-sm font-semibold text-cyan-500">{summary.avgSurvivalRate}%</div>
              <div className="text-[9px] text-muted-foreground">rate</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Area Restored</div>
              <div className="text-sm font-semibold">{summary.totalAreaRestored}</div>
              <div className="text-[9px] text-muted-foreground">hectares</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Thriving</div>
              <div className="text-sm font-semibold text-green-500">{summary.thrivingCount}</div>
              <div className="text-[9px] text-muted-foreground">projects</div>
            </div>
          </div>

          <Separator />

          {/* Project List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Restoration Projects ({filteredProjects.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredProjects.map((project) => {
                  const isActive = coralRestoration.activeProjectId === project.id
                  const healthCfg = HEALTH_STATUS_CONFIG[project.healthStatus]
                  return (
                    <div
                      key={project.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setCoralRestoration({
                          activeProjectId: isActive ? null : project.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{project.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {coralRestoration.showSurvivalRate && (
                          <div>
                            Survival:{' '}
                            <span className="text-foreground font-medium">
                              {project.survivalRate}%
                            </span>
                          </div>
                        )}
                        {coralRestoration.showAreaRestored && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {project.areaRestored} ha
                            </span>
                          </div>
                        )}
                        {coralRestoration.showHealthStatus && (
                          <div>
                            Health:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${healthCfg.bgClass}`}
                            >
                              {healthCfg.label}
                            </Badge>
                          </div>
                        )}
                        {coralRestoration.showTechnique && (
                          <div>
                            Technique:{' '}
                            <span className="text-foreground font-medium">
                              {TECHNIQUE_LABELS[project.technique]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredProjects.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No projects match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Project Details */}
          {activeProject && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeProject.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_STATUS_CONFIG[activeProject.healthStatus].bgClass}`}
                  >
                    {HEALTH_STATUS_CONFIG[activeProject.healthStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeProject.latitude.toFixed(2)}, {activeProject.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Survival Rate: </span>
                    <span className="font-medium">{activeProject.survivalRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area Restored: </span>
                    <span className="font-medium">{activeProject.areaRestored} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species Count: </span>
                    <span className="font-medium">{activeProject.speciesCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Years Active: </span>
                    <span className="font-medium">{activeProject.yearsActive}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technique: </span>
                    <span className="font-medium">{TECHNIQUE_LABELS[activeProject.technique]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Funding: </span>
                    <span className="font-medium capitalize">{activeProject.fundingSource}</span>
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
