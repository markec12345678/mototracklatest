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
import { useMapStore, type SaharaReforestationState, type SaharaReforestationProject } from '@/lib/map-store'
import { TreePine as TreePineIcon2, X, MapPin, TrendingUp, Activity, Filter } from 'lucide-react'

const DEMO_PROJECTS: SaharaReforestationProject[] = [
  {
    id: 'sr-greatgreenwall',
    name: 'Great Green Wall - Senegal',
    latitude: 15.5,
    longitude: -14.4,
    areaRestored: 12000,
    treeCount: 850000,
    speciesDiversity: 24,
    waterUsage: 3200,
    survivalRate: 72,
    status: 'growing',
    yearStarted: 2008,
  },
  {
    id: 'sr-saharaolive',
    name: 'Sahara Olive Restoration',
    latitude: 23.4,
    longitude: 25.6,
    areaRestored: 4500,
    treeCount: 320000,
    speciesDiversity: 12,
    waterUsage: 1800,
    survivalRate: 65,
    status: 'planting',
    yearStarted: 2019,
  },
  {
    id: 'sr-tassili',
    name: 'Tassili Plateau Reforestation',
    latitude: 25.3,
    longitude: 8.1,
    areaRestored: 1800,
    treeCount: 95000,
    speciesDiversity: 8,
    waterUsage: 600,
    survivalRate: 88,
    status: 'established',
    yearStarted: 2003,
  },
  {
    id: 'sr-airmtns',
    name: 'Air Mountains Grove',
    latitude: 19.2,
    longitude: 8.9,
    areaRestored: 600,
    treeCount: 45000,
    speciesDiversity: 6,
    waterUsage: 250,
    survivalRate: 45,
    status: 'threatened',
    yearStarted: 2015,
  },
  {
    id: 'sr-chadbasin',
    name: 'Lake Chad Basin Project',
    latitude: 13.5,
    longitude: 14.0,
    areaRestored: 8000,
    treeCount: 620000,
    speciesDiversity: 18,
    waterUsage: 2800,
    survivalRate: 78,
    status: 'growing',
    yearStarted: 2012,
  },
  {
    id: 'sr-mauritania',
    name: 'Mauritania Sahel Initiative',
    latitude: 18.1,
    longitude: -15.9,
    areaRestored: 0,
    treeCount: 0,
    speciesDiversity: 0,
    waterUsage: 0,
    survivalRate: 0,
    status: 'planned',
    yearStarted: 2025,
  },
]

const STATUS_CONFIG: Record<
  SaharaReforestationProject['status'],
  { label: string; color: string; bgClass: string }
> = {
  planned: { label: 'Planned', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  planting: { label: 'Planting', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  growing: { label: 'Growing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  established: { label: 'Established', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  threatened: { label: 'Threatened', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SaharaReforestationTracker() {
  const saharaReforestation = useMapStore((s) => s.saharaReforestation)
  const setSaharaReforestation = useMapStore((s) => s.setSaharaReforestation)

  const projects = useMemo(
    () => (saharaReforestation.projects.length > 0 ? saharaReforestation.projects : DEMO_PROJECTS),
    [saharaReforestation.projects]
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (saharaReforestation.statusFilter !== 'all' && p.status !== saharaReforestation.statusFilter) return false
      return true
    })
  }, [projects, saharaReforestation.statusFilter])

  const summary = useMemo(() => {
    if (filteredProjects.length === 0) {
      return { totalArea: 0, totalTrees: 0, avgSurvivalRate: 0 }
    }
    const totalArea = filteredProjects.reduce((sum, p) => sum + p.areaRestored, 0)
    const totalTrees = filteredProjects.reduce((sum, p) => sum + p.treeCount, 0)
    const withSurvival = filteredProjects.filter((p) => p.survivalRate > 0)
    const avgSurvivalRate =
      withSurvival.length > 0
        ? Math.round((withSurvival.reduce((sum, p) => sum + p.survivalRate, 0) / withSurvival.length) * 10) / 10
        : 0
    return { totalArea, totalTrees, avgSurvivalRate }
  }, [filteredProjects])

  const activeProject = useMemo(
    () => projects.find((p) => p.id === saharaReforestation.activeProjectId) ?? null,
    [projects, saharaReforestation.activeProjectId]
  )

  if (typeof window === 'undefined') return null
  if (!saharaReforestation.open) return null

  const overlayToggles: { key: keyof SaharaReforestationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: MapPin },
    { key: 'showTreeCount', label: 'Tree Count', icon: TreePineIcon2 },
    { key: 'showSurvivalRate', label: 'Survival Rate', icon: TrendingUp },
    { key: 'showStatus', label: 'Status', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePineIcon2 className="h-4 w-4 text-emerald-500" />
              Sahara Reforestation Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSaharaReforestation({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Project Status
            </Label>
            <Select
              value={saharaReforestation.statusFilter}
              onValueChange={(v) =>
                setSaharaReforestation({
                  statusFilter: v as SaharaReforestationState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="planting">Planting</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="established">Established</SelectItem>
                <SelectItem value="threatened">Threatened</SelectItem>
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
                  <Icon className="h-3 w-3 text-emerald-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={saharaReforestation[key] as boolean}
                  onCheckedChange={(checked) => setSaharaReforestation({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Area</div>
              <div className="text-sm font-semibold">{(summary.totalArea / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-muted-foreground">hectares</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Trees</div>
              <div className="text-sm font-semibold text-emerald-500">{(summary.totalTrees / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-muted-foreground">planted</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Survival</div>
              <div className="text-sm font-semibold">{summary.avgSurvivalRate}%</div>
              <div className="text-[9px] text-muted-foreground">rate</div>
            </div>
          </div>

          <Separator />

          {/* Project List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Reforestation Projects ({filteredProjects.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredProjects.map((project) => {
                  const isActive = saharaReforestation.activeProjectId === project.id
                  const statusCfg = STATUS_CONFIG[project.status]
                  return (
                    <div
                      key={project.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setSaharaReforestation({
                          activeProjectId: isActive ? null : project.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium">{project.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {saharaReforestation.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {project.areaRestored.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {saharaReforestation.showTreeCount && (
                          <div>
                            Trees:{' '}
                            <span className="text-foreground font-medium">
                              {project.treeCount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {saharaReforestation.showSurvivalRate && (
                          <div>
                            Survival:{' '}
                            <span className="text-foreground font-medium">
                              {project.survivalRate}%
                            </span>
                          </div>
                        )}
                        {saharaReforestation.showStatus && (
                          <div>
                            Year:{' '}
                            <span className="text-foreground font-medium">
                              {project.yearStarted}
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
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeProject.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeProject.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeProject.status].label}
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
                    <span className="text-muted-foreground">Area Restored: </span>
                    <span className="font-medium">{activeProject.areaRestored.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tree Count: </span>
                    <span className="font-medium">{activeProject.treeCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species Diversity: </span>
                    <span className="font-medium">{activeProject.speciesDiversity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Survival Rate: </span>
                    <span className="font-medium">{activeProject.survivalRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Usage: </span>
                    <span className="font-medium">{activeProject.waterUsage.toLocaleString()} m³/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year Started: </span>
                    <span className="font-medium">{activeProject.yearStarted}</span>
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
