'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type WildlifeObservation } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  PawPrint,
  Search,
  Plus,
  Download,
  MapPin,
  Calendar,
  Trees,
  Eye,
  FlameKindling,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const HABITATS = ['Forest', 'Grassland', 'Wetland', 'Desert', 'Marine', 'Urban', 'Mountain', 'River']
const BEHAVIORS = ['Foraging', 'Resting', 'Migrating', 'Nesting', 'Hunting', 'Socializing', 'Vocalizing']

const SPECIES_COLORS = [
  '#10b981', '#059669', '#0d9488', '#14b8a6', '#06b6d4', '#0ea5e9', '#22c55e', '#84cc16',
  '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#3b82f6', '#a855f7',
]

function generateId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function WildlifeTracker() {
  const wildlifeTracker = useMapStore((s) => s.wildlifeTracker)
  const setWildlifeTracker = useMapStore((s) => s.setWildlifeTracker)
  const center = useMapStore((s) => s.center)

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    species: '',
    commonName: '',
    count: 1,
    habitat: 'Forest',
    behavior: 'Foraging',
    notes: '',
  })

  const observations = wildlifeTracker.observations
  const filterSpecies = wildlifeTracker.filterSpecies

  const filteredObservations = useMemo(() => {
    let obs = observations
    if (filterSpecies.length > 0) {
      obs = obs.filter((o) => filterSpecies.includes(o.species))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      obs = obs.filter(
        (o) =>
          o.species.toLowerCase().includes(q) ||
          o.commonName.toLowerCase().includes(q) ||
          o.habitat.toLowerCase().includes(q)
      )
    }
    return obs
  }, [observations, filterSpecies, searchQuery])

  const speciesList = useMemo(() => {
    const map = new Map<string, number>()
    observations.forEach((o) => {
      map.set(o.commonName, (map.get(o.commonName) || 0) + o.count)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count], i) => ({
        name: name.length > 14 ? name.slice(0, 12) + '...' : name,
        count,
        color: SPECIES_COLORS[i % SPECIES_COLORS.length],
      }))
  }, [observations])

  const allSpeciesNames = useMemo(() => {
    const set = new Set(observations.map((o) => o.species))
    return Array.from(set).sort()
  }, [observations])

  const stats = useMemo(() => {
    const speciesSet = new Set(observations.map((o) => o.species))
    return {
      totalSpecies: speciesSet.size,
      totalObservations: observations.reduce((sum, o) => sum + o.count, 0),
      totalRecords: observations.length,
    }
  }, [observations])

  const handleAddObservation = useCallback(() => {
    if (!formData.species.trim() || !formData.commonName.trim()) {
      toast.error('Species and common name are required')
      return
    }
    const [lng, lat] = center
    const newObs: WildlifeObservation = {
      id: generateId(),
      species: formData.species.trim(),
      commonName: formData.commonName.trim(),
      latitude: lat,
      longitude: lng,
      count: formData.count,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      habitat: formData.habitat,
      behavior: formData.behavior,
      notes: formData.notes,
      photo: null,
    }
    setWildlifeTracker({
      observations: [...observations, newObs],
      totalSpecies: new Set([...observations, newObs].map((o) => o.species)).size,
      totalObservations: [...observations, newObs].reduce((sum, o) => sum + o.count, 0),
    })
    setFormData({ species: '', commonName: '', count: 1, habitat: 'Forest', behavior: 'Foraging', notes: '' })
    setShowAddForm(false)
    toast.success(`Added ${newObs.commonName} observation`)
  }, [formData, center, observations, setWildlifeTracker])

  const handleExportCSV = useCallback(() => {
    if (typeof window === 'undefined') return
    const headers = ['ID', 'Species', 'Common Name', 'Latitude', 'Longitude', 'Count', 'Date', 'Time', 'Habitat', 'Behavior', 'Notes']
    const rows = observations.map((o) => [o.id, o.species, o.commonName, o.latitude, o.longitude, o.count, o.date, o.time, o.habitat, o.behavior, `"${o.notes}"`])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wildlife-observations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully')
  }, [observations])

  const toggleSpeciesFilter = useCallback((species: string) => {
    const current = filterSpecies
    const next = current.includes(species)
      ? current.filter((s) => s !== species)
      : [...current, species]
    setWildlifeTracker({ filterSpecies: next })
  }, [filterSpecies, setWildlifeTracker])

  return (
    <Dialog open={wildlifeTracker.open} onOpenChange={(open) => setWildlifeTracker({ open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            Wildlife Tracker
            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
              {stats.totalSpecies} species · {stats.totalObservations} obs
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="observations" className="w-full">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="observations" className="flex-1">Observations</TabsTrigger>
              <TabsTrigger value="species" className="flex-1">Species</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <TabsContent value="observations" className="p-4 pt-2 space-y-3">
              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-500" />
                    <Label className="text-sm">Show Observations</Label>
                  </div>
                  <Switch checked={wildlifeTracker.showObservations} onCheckedChange={(v) => setWildlifeTracker({ showObservations: v })} aria-label="Toggle observations" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlameKindling className="h-4 w-4 text-emerald-500" />
                    <Label className="text-sm">Show Heatmap</Label>
                  </div>
                  <Switch checked={wildlifeTracker.showHeatmap} onCheckedChange={(v) => setWildlifeTracker({ showHeatmap: v })} aria-label="Toggle heatmap" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trees className="h-4 w-4 text-emerald-500" />
                    <Label className="text-sm">Migration Paths</Label>
                  </div>
                  <Switch checked={wildlifeTracker.showMigrationPaths} onCheckedChange={(v) => setWildlifeTracker({ showMigrationPaths: v })} aria-label="Toggle migration paths" />
                </div>
              </div>

              <Separator />

              {/* Search & Actions */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search observations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 text-xs pl-8" />
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleExportCSV} disabled={observations.length === 0}>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
                  <CardContent className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Species *</Label>
                        <Input className="h-7 text-xs" value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="e.g. Canis lupus" />
                      </div>
                      <div>
                        <Label className="text-xs">Common Name *</Label>
                        <Input className="h-7 text-xs" value={formData.commonName} onChange={(e) => setFormData({ ...formData, commonName: e.target.value })} placeholder="e.g. Gray Wolf" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Count</Label>
                        <Input type="number" min={1} className="h-7 text-xs" value={formData.count} onChange={(e) => setFormData({ ...formData, count: Math.max(1, parseInt(e.target.value) || 1) })} />
                      </div>
                      <div>
                        <Label className="text-xs">Habitat</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.habitat} onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}>
                          {HABITATS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Behavior</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.behavior} onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}>
                          {BEHAVIORS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input className="h-7 text-xs" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleAddObservation}>
                        <Plus className="h-3 w-3" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observation list */}
              {filteredObservations.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No observations yet</p>
                  <p className="text-xs mt-1">Click &quot;Add&quot; to record your first sighting</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredObservations.map((obs) => (
                    <Card
                      key={obs.id}
                      className={`cursor-pointer hover:shadow-sm transition-shadow ${wildlifeTracker.activeObservationId === obs.id ? 'border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-300' : ''}`}
                      onClick={() => setWildlifeTracker({ activeObservationId: wildlifeTracker.activeObservationId === obs.id ? null : obs.id })}
                    >
                      <CardContent className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[9px] px-1.5">
                              {obs.count}x
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{obs.commonName}</p>
                              <p className="text-[10px] text-muted-foreground italic truncate">{obs.species}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-muted-foreground">{obs.date}</p>
                          </div>
                        </div>
                        {wildlifeTracker.activeObservationId === obs.id && (
                          <div className="mt-2 pt-2 border-t space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {obs.latitude.toFixed(4)}, {obs.longitude.toFixed(4)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Trees className="h-3 w-3" />
                              {obs.habitat}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {obs.date} {obs.time}
                            </div>
                            {obs.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">&quot;{obs.notes}&quot;</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="species" className="p-4 pt-2 space-y-3">
              {/* Species filter */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Filter by Species</p>
                <div className="flex flex-wrap gap-1.5">
                  {allSpeciesNames.map((sp) => (
                    <Badge
                      key={sp}
                      variant={filterSpecies.includes(sp) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] hover:opacity-80 transition-opacity"
                      onClick={() => toggleSpeciesFilter(sp)}
                    >
                      {sp}
                    </Badge>
                  ))}
                  {allSpeciesNames.length === 0 && (
                    <p className="text-xs text-muted-foreground">No species recorded yet</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Species bar chart */}
              {speciesList.length > 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Top Species by Count</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={speciesList} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {speciesList.map((entry, index) => (
                            <Cell key={`sp-cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No species data to chart</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="p-4 pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalSpecies}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Species</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalObservations}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Observations</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalRecords}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Records</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent activity */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Recent Activity</p>
                  {observations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      {observations.slice(-5).reverse().map((obs) => (
                        <div key={obs.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{obs.commonName}</span>
                          <span className="text-muted-foreground">{obs.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
