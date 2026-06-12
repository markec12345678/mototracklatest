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
import { useMapStore, type HeritageSite } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  Landmark as LandmarkIcon,
  Plus,
  Download,
  MapPin,
  Star,
  Shield,
  Clock,
  Filter,
  ImageIcon,
} from 'lucide-react'

const SITE_TYPES: HeritageSite['type'][] = ['unesco', 'national', 'local', 'archaeological', 'monument', 'museum', 'religious']
const TYPE_LABELS: Record<string, string> = {
  unesco: 'UNESCO',
  national: 'National',
  local: 'Local',
  archaeological: 'Archaeological',
  monument: 'Monument',
  museum: 'Museum',
  religious: 'Religious',
}
const TYPE_COLORS: Record<string, string> = {
  unesco: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300',
  national: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-300',
  local: 'bg-yellow-600/10 text-yellow-700 dark:text-yellow-400 border-yellow-500',
  archaeological: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-400',
  monument: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-300',
  museum: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300',
  religious: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300',
}

const PROTECTION_STYLES: Record<string, { bg: string; label: string }> = {
  high: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-400', label: 'High Protection' },
  medium: { bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-400', label: 'Medium Protection' },
  low: { bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-400', label: 'Low Protection' },
}

const ERAS = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Renaissance', 'Colonial', 'Modern', 'Contemporary']

function generateId(): string {
  return `ch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function CulturalHeritageMap() {
  const culturalHeritage = useMapStore((s) => s.culturalHeritage)
  const setCulturalHeritage = useMapStore((s) => s.setCulturalHeritage)
  const center = useMapStore((s) => s.center)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'local' as HeritageSite['type'],
    era: 'Modern',
    description: '',
    protectionLevel: 'medium' as HeritageSite['protectionLevel'],
    visitInfo: '',
    rating: 3,
  })

  const sites = culturalHeritage.sites
  const filterType = culturalHeritage.filterType
  const filterEra = culturalHeritage.filterEra

  const filteredSites = useMemo(() => {
    let s = sites
    if (filterType.length > 0) {
      s = s.filter((site) => filterType.includes(site.type))
    }
    if (filterEra.length > 0) {
      s = s.filter((site) => filterEra.includes(site.era))
    }
    return s
  }, [sites, filterType, filterEra])

  const timelineSites = useMemo(() => {
    const eraOrder = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Renaissance', 'Colonial', 'Modern', 'Contemporary']
    const grouped = new Map<string, HeritageSite[]>()
    sites.forEach((site) => {
      const list = grouped.get(site.era) || []
      list.push(site)
      grouped.set(site.era, list)
    })
    return eraOrder
      .filter((era) => grouped.has(era))
      .map((era) => ({ era, sites: grouped.get(era)! }))
  }, [sites])

  const handleAddSite = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Site name is required')
      return
    }
    const [lng, lat] = center
    const newSite: HeritageSite = {
      id: generateId(),
      name: formData.name.trim(),
      latitude: lat,
      longitude: lng,
      type: formData.type,
      era: formData.era,
      description: formData.description,
      protectionLevel: formData.protectionLevel,
      visitInfo: formData.visitInfo,
      rating: formData.rating,
      photos: [],
    }
    setCulturalHeritage({ sites: [...sites, newSite] })
    setFormData({ name: '', type: 'local', era: 'Modern', description: '', protectionLevel: 'medium', visitInfo: '', rating: 3 })
    setShowAddForm(false)
    toast.success(`Added "${newSite.name}" heritage site`)
  }, [formData, center, sites, setCulturalHeritage])

  const handleExportGeoJSON = useCallback(() => {
    if (typeof window === 'undefined') return
    const geojson = {
      type: 'FeatureCollection' as const,
      features: filteredSites.map((site) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [site.longitude, site.latitude],
        },
        properties: {
          name: site.name,
          type: site.type,
          era: site.era,
          protectionLevel: site.protectionLevel,
          rating: site.rating,
          description: site.description,
          visitInfo: site.visitInfo,
        },
      })),
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heritage-sites-${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GeoJSON exported successfully')
  }, [filteredSites])

  const toggleTypeFilter = useCallback((type: string) => {
    const next = filterType.includes(type) ? filterType.filter((t) => t !== type) : [...filterType, type]
    setCulturalHeritage({ filterType: next })
  }, [filterType, setCulturalHeritage])

  const toggleEraFilter = useCallback((era: string) => {
    const next = filterEra.includes(era) ? filterEra.filter((e) => e !== era) : [...filterEra, era]
    setCulturalHeritage({ filterEra: next })
  }, [filterEra, setCulturalHeritage])

  return (
    <Dialog open={culturalHeritage.open} onOpenChange={(open) => setCulturalHeritage({ open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <LandmarkIcon className="h-4 w-4 text-white" />
            </div>
            Cultural Heritage Map
            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
              {sites.length} sites
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sites" className="w-full">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="sites" className="flex-1">Sites</TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
              <TabsTrigger value="filter" className="flex-1">Filter</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <TabsContent value="sites" className="p-4 pt-2 space-y-3">
              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LandmarkIcon className="h-4 w-4 text-amber-500" />
                    <Label className="text-sm">Show Sites</Label>
                  </div>
                  <Switch checked={culturalHeritage.showSites} onCheckedChange={(v) => setCulturalHeritage({ showSites: v })} aria-label="Toggle sites" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <Label className="text-sm">Protection Zones</Label>
                  </div>
                  <Switch checked={culturalHeritage.showProtectionZones} onCheckedChange={(v) => setCulturalHeritage({ showProtectionZones: v })} aria-label="Toggle protection zones" />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Site
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleExportGeoJSON} disabled={sites.length === 0}>
                  <Download className="h-3.5 w-3.5" />
                  Export GeoJSON
                </Button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <Label className="text-xs">Site Name *</Label>
                      <Input className="h-7 text-xs" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Colosseum" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as HeritageSite['type'] })}>
                          {SITE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Era</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.era} onChange={(e) => setFormData({ ...formData, era: e.target.value })}>
                          {ERAS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Protection Level</Label>
                        <select className="h-7 w-full rounded-md border bg-background text-xs px-2" value={formData.protectionLevel} onChange={(e) => setFormData({ ...formData, protectionLevel: e.target.value as HeritageSite['protectionLevel'] })}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Rating ({formData.rating}/5)</Label>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 cursor-pointer ${i < formData.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                              onClick={() => setFormData({ ...formData, rating: i + 1 })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input className="h-7 text-xs" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
                    </div>
                    <div>
                      <Label className="text-xs">Visit Info</Label>
                      <Input className="h-7 text-xs" value={formData.visitInfo} onChange={(e) => setFormData({ ...formData, visitInfo: e.target.value })} placeholder="Hours, tickets, etc." />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700" onClick={handleAddSite}>
                        <Plus className="h-3 w-3" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Site list */}
              {filteredSites.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <LandmarkIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No heritage sites yet</p>
                  <p className="text-xs mt-1">Click &quot;Add Site&quot; to record a location</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredSites.map((site) => (
                    <Card
                      key={site.id}
                      className={`cursor-pointer hover:shadow-sm transition-shadow ${culturalHeritage.activeSiteId === site.id ? 'border-amber-400 dark:border-amber-700 ring-1 ring-amber-300' : ''}`}
                      onClick={() => setCulturalHeritage({ activeSiteId: culturalHeritage.activeSiteId === site.id ? null : site.id })}
                    >
                      <CardContent className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge className={`${TYPE_COLORS[site.type]} border text-[9px] px-1.5`}>
                              {TYPE_LABELS[site.type]}
                            </Badge>
                            <span className="text-sm font-medium truncate">{site.name}</span>
                          </div>
                          <RatingStars rating={site.rating} />
                        </div>
                        {culturalHeritage.activeSiteId === site.id && (
                          <div className="mt-2 pt-2 border-t space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {site.era}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              <Badge className={`${PROTECTION_STYLES[site.protectionLevel].bg} border text-[9px] px-1.5`}>
                                {PROTECTION_STYLES[site.protectionLevel].label}
                              </Badge>
                            </div>
                            {site.description && (
                              <p className="text-xs text-muted-foreground mt-1">{site.description}</p>
                            )}
                            {site.visitInfo && (
                              <p className="text-xs text-muted-foreground italic">{site.visitInfo}</p>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <ImageIcon className="h-3 w-3" />
                              {site.photos.length} photos
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="p-4 pt-2 space-y-3">
              {timelineSites.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No sites to display on timeline</p>
                </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-amber-300 dark:bg-amber-700" />
                  {timelineSites.map(({ era, sites: eraSites }) => (
                    <div key={era} className="mb-4 relative">
                      <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-background" />
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">{era}</p>
                      <div className="space-y-1">
                        {eraSites.map((site) => (
                          <div key={site.id} className="flex items-center gap-2 text-xs pl-2">
                            <Badge className={`${TYPE_COLORS[site.type]} border text-[8px] px-1`}>
                              {TYPE_LABELS[site.type]}
                            </Badge>
                            <span className="truncate">{site.name}</span>
                            <RatingStars rating={site.rating} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="filter" className="p-4 pt-2 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filter by Type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SITE_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={filterType.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] hover:opacity-80 transition-opacity"
                      onClick={() => toggleTypeFilter(type)}
                    >
                      {TYPE_LABELS[type]}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Filter by Era
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ERAS.map((era) => (
                    <Badge
                      key={era}
                      variant={filterEra.includes(era) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] hover:opacity-80 transition-opacity"
                      onClick={() => toggleEraFilter(era)}
                    >
                      {era}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Summary</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{sites.length}</p>
                      <p className="text-[10px] text-muted-foreground">Total Sites</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{filteredSites.length}</p>
                      <p className="text-[10px] text-muted-foreground">Filtered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
