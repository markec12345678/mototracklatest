'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Plus,
  Trash2,
  Compass,
  Star,
  Eye,
  EyeOff,
  Download,
  Trophy,
  Search,
  Target,
  Navigation,
  BarChart3,
  TreePine,
  Globe,
  Package,
  HelpCircle,
  Filter,
} from 'lucide-react'
import { useMapStore, type Geocache } from '@/lib/map-store'
import { toast } from 'sonner'

const CACHE_TYPES: { value: Geocache['type']; label: string; icon: typeof MapPin; color: string }[] = [
  { value: 'traditional', label: 'Traditional', icon: MapPin, color: 'text-green-600' },
  { value: 'multi', label: 'Multi-Cache', icon: Target, color: 'text-lime-600' },
  { value: 'mystery', label: 'Mystery', icon: HelpCircle, color: 'text-emerald-600' },
  { value: 'earthcache', label: 'EarthCache', icon: Globe, color: 'text-teal-600' },
  { value: 'letterbox', label: 'Letterbox', icon: Package, color: 'text-amber-600' },
  { value: 'event', label: 'Event', icon: Star, color: 'text-yellow-600' },
]

const CACHE_SIZES: Geocache['size'][] = ['micro', 'small', 'regular', 'large', 'other']
const CACHE_STATUSES: { value: Geocache['status']; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'found', label: 'Found', color: 'bg-lime-500' },
  { value: 'dnf', label: 'DNF', color: 'bg-amber-500' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-500' },
]

function createCache(lat: number, lng: number): Geocache {
  return {
    id: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'New Cache',
    code: `GC${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    latitude: lat,
    longitude: lng,
    type: 'traditional',
    difficulty: 2,
    terrain: 2,
    size: 'regular',
    status: 'active',
    hint: '',
    description: '',
    foundDate: null,
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function GeocachingToolkit() {
  const geocaching = useMapStore((s) => s.geocaching)
  const setGeocaching = useMapStore((s) => s.setGeocaching)
  const center = useMapStore((s) => s.center)

  const [activeTab, setActiveTab] = useState('caches')
  const [editingCache, setEditingCache] = useState<string | null>(null)
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set())
  const [gcCodeInput, setGcCodeInput] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const open = geocaching.open

  const handleClose = useCallback((value: boolean) => {
    if (!value) setGeocaching({ open: false })
  }, [setGeocaching])

  const handleAddCache = useCallback(() => {
    const cache = createCache(center[1], center[0])
    setGeocaching({ caches: [...geocaching.caches, cache], totalSearched: geocaching.totalSearched + 1 })
    setEditingCache(cache.id)
    toast.success('Cache added')
  }, [center, geocaching.caches, geocaching.totalSearched, setGeocaching])

  const handleAddByCode = useCallback(() => {
    if (!gcCodeInput.trim()) return
    const cache = createCache(center[1], center[0])
    cache.code = gcCodeInput.trim().toUpperCase()
    cache.name = `Cache ${cache.code}`
    setGeocaching({ caches: [...geocaching.caches, cache], totalSearched: geocaching.totalSearched + 1 })
    setGcCodeInput('')
    toast.success(`Added cache ${cache.code}`)
  }, [gcCodeInput, center, geocaching.caches, geocaching.totalSearched, setGeocaching])

  const handleRemoveCache = useCallback((id: string) => {
    setGeocaching({ caches: geocaching.caches.filter((c) => c.id !== id) })
  }, [geocaching.caches, setGeocaching])

  const handleUpdateCache = useCallback((id: string, updates: Partial<Geocache>) => {
    setGeocaching({
      caches: geocaching.caches.map((c) => c.id === id ? { ...c, ...updates } : c),
    })
  }, [geocaching.caches, setGeocaching])

  const handleMarkFound = useCallback((id: string) => {
    handleUpdateCache(id, { status: 'found', foundDate: new Date().toISOString().split('T')[0] })
    setGeocaching({ foundCount: geocaching.foundCount + 1 })
    toast.success('Cache marked as found! 🎉')
  }, [handleUpdateCache, geocaching.foundCount, setGeocaching])

  const handleMarkDNF = useCallback((id: string) => {
    handleUpdateCache(id, { status: 'dnf' })
    toast.info('Marked as Did Not Find')
  }, [handleUpdateCache])

  const toggleHint = useCallback((id: string) => {
    setRevealedHints((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleExportGPX = useCallback(() => {
    if (typeof window === 'undefined') return
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MapApp">
  <metadata><name>Geocaches Export</name></metadata>
${geocaching.caches.map((c) => `  <wpt lat="${c.latitude}" lon="${c.longitude}">
    <name>${c.code}: ${c.name}</name>
    <desc>${c.description}</desc>
    <type>${c.type}</type>
  </wpt>`).join('\n')}
</gpx>`
    const blob = new Blob([gpx], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'geocaches.gpx'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GPX exported')
  }, [geocaching.caches])

  const activeCache = geocaching.caches.find((c) => c.id === geocaching.activeCacheId)

  const filteredCaches = geocaching.caches.filter((c) => {
    if (geocaching.filterType.length > 0 && !geocaching.filterType.includes(c.type)) return false
    if (c.difficulty < geocaching.filterDifficulty[0] || c.difficulty > geocaching.filterDifficulty[1]) return false
    if (c.terrain < geocaching.filterTerrain[0] || c.terrain > geocaching.filterTerrain[1]) return false
    return true
  })

  const compassData = activeCache ? {
    bearing: calculateBearing(center[1], center[0], activeCache.latitude, activeCache.longitude),
    distance: haversineDistance(center[1], center[0], activeCache.latitude, activeCache.longitude),
  } : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-green-500/10 via-lime-500/10 to-transparent">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Compass className="h-4.5 w-4.5 text-green-600" />
            Geocaching Toolkit
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage geocaches, navigate, and track your finds
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 border-b">
            <TabsList className="h-8">
              <TabsTrigger value="caches" className="text-xs gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Caches
              </TabsTrigger>
              <TabsTrigger value="navigation" className="text-xs gap-1.5">
                <Compass className="h-3.5 w-3.5" /> Navigation
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="caches" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-3">
                {/* Add Controls */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white"
                    onClick={handleAddCache}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Cache
                  </Button>
                  <div className="flex gap-1 flex-1">
                    <Input
                      value={gcCodeInput}
                      onChange={(e) => setGcCodeInput(e.target.value)}
                      placeholder="GC Code"
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handleAddByCode}
                      disabled={!gcCodeInput.trim()}
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <Filter className="h-3 w-3" /> {filterOpen ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  {filterOpen && (
                    <div className="p-3 rounded-lg border bg-card space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px]">Type</Label>
                        <div className="flex flex-wrap gap-1">
                          {CACHE_TYPES.map((ct) => (
                            <Button
                              key={ct.value}
                              variant={geocaching.filterType.includes(ct.value) ? 'default' : 'outline'}
                              size="sm"
                              className="h-6 text-[9px] gap-0.5"
                              onClick={() => {
                                const next = geocaching.filterType.includes(ct.value)
                                  ? geocaching.filterType.filter((t) => t !== ct.value)
                                  : [...geocaching.filterType, ct.value]
                                setGeocaching({ filterType: next })
                              }}
                            >
                              {ct.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Difficulty ({geocaching.filterDifficulty[0]}–{geocaching.filterDifficulty[1]})</Label>
                        <Slider
                          value={geocaching.filterDifficulty}
                          min={1}
                          max={5}
                          step={0.5}
                          onValueChange={(v) => setGeocaching({ filterDifficulty: v as [number, number] })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Terrain ({geocaching.filterTerrain[0]}–{geocaching.filterTerrain[1]})</Label>
                        <Slider
                          value={geocaching.filterTerrain}
                          min={1}
                          max={5}
                          step={0.5}
                          onValueChange={(v) => setGeocaching({ filterTerrain: v as [number, number] })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cache List */}
                {filteredCaches.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                    <MapPin className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
                    <p className="text-[10px]">{geocaching.caches.length === 0 ? 'No caches added' : 'No caches match filters'}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredCaches.map((cache) => {
                      const typeInfo = CACHE_TYPES.find((t) => t.value === cache.type)
                      const statusInfo = CACHE_STATUSES.find((s) => s.value === cache.status)
                      const isEditing = editingCache === cache.id
                      const isRevealed = revealedHints.has(cache.id)
                      const isActive = geocaching.activeCacheId === cache.id

                      return (
                        <div
                          key={cache.id}
                          className={`p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isActive ? 'border-green-400/50 bg-green-500/5' : 'hover:bg-accent/30'
                          }`}
                          onClick={() => {
                            setGeocaching({ activeCacheId: cache.id })
                            if (!isEditing) setEditingCache(null)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {typeInfo && <typeInfo.icon className={`h-3.5 w-3.5 ${typeInfo.color}`} />}
                            {isEditing ? (
                              <Input
                                value={cache.name}
                                onChange={(e) => handleUpdateCache(cache.id, { name: e.target.value })}
                                className="h-6 text-[11px] flex-1"
                                onBlur={() => setEditingCache(null)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <span
                                className="flex-1 font-medium truncate"
                                onDoubleClick={(e) => { e.stopPropagation(); setEditingCache(cache.id) }}
                              >
                                {cache.name}
                              </span>
                            )}
                            <Badge variant="secondary" className="text-[8px] px-1.5 h-4 font-mono">
                              {cache.code}
                            </Badge>
                            {statusInfo && <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleRemoveCache(cache.id) }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[10px] text-muted-foreground">
                            <span>Diff: {cache.difficulty}/5</span>
                            <span>Terr: {cache.terrain}/5</span>
                            <span className="capitalize">{cache.size}</span>
                            <span className="capitalize">{cache.status}</span>
                          </div>

                          {/* Hint reveal */}
                          {cache.hint && (
                            <div className="mt-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[9px] gap-1 px-1.5"
                                onClick={(e) => { e.stopPropagation(); toggleHint(cache.id) }}
                              >
                                {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                {isRevealed ? 'Hide Hint' : 'Show Hint'}
                              </Button>
                              {isRevealed && (
                                <p className="text-[10px] text-amber-600 mt-0.5 italic">{cache.hint}</p>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-1.5 mt-1.5">
                            {cache.status === 'active' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 text-[9px] gap-0.5 text-green-600 hover:text-green-700"
                                  onClick={(e) => { e.stopPropagation(); handleMarkFound(cache.id) }}
                                >
                                  <Trophy className="h-2.5 w-2.5" /> Found
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-5 text-[9px] gap-0.5 text-amber-600 hover:text-amber-700"
                                  onClick={(e) => { e.stopPropagation(); handleMarkDNF(cache.id) }}
                                >
                                  DNF
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="navigation" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {activeCache && compassData ? (
                  <div className="space-y-4">
                    {/* Compass Display */}
                    <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
                      <div
                        className="relative w-32 h-32 rounded-full border-4 border-green-200 dark:border-green-900 flex items-center justify-center"
                      >
                        <div
                          className="absolute w-1 h-12 bg-gradient-to-t from-green-600 to-lime-400 rounded-full origin-bottom"
                          style={{
                            transform: `rotate(${compassData.bearing}deg)`,
                            bottom: '50%',
                          }}
                        />
                        <div className="w-3 h-3 rounded-full bg-green-500 z-10" />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{compassData.bearing.toFixed(1)}°</p>
                        <p className="text-xs text-muted-foreground">
                          {compassData.distance >= 1000
                            ? `${(compassData.distance / 1000).toFixed(2)} km`
                            : `${compassData.distance.toFixed(0)} m`}
                          {' '}to {activeCache.name}
                        </p>
                      </div>
                    </div>

                    {/* Cache details */}
                    <div className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{activeCache.name}</span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 h-4 font-mono">{activeCache.code}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {activeCache.latitude.toFixed(6)}, {activeCache.longitude.toFixed(6)}
                      </p>
                      {activeCache.description && (
                        <p className="text-[10px] text-muted-foreground">{activeCache.description}</p>
                      )}
                      <div className="flex gap-2 text-[10px]">
                        <span>Difficulty: {activeCache.difficulty}/5</span>
                        <span>Terrain: {activeCache.terrain}/5</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Compass className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Select a cache to navigate</p>
                    <p className="text-[10px] mt-1">Click on a cache in the Caches tab</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="max-h-[60vh]">
              <div className="p-4 space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-lime-500" />
                    <p className="text-lg font-bold">{geocaching.foundCount}</p>
                    <p className="text-[10px] text-muted-foreground">Found</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card text-center">
                    <Search className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">{geocaching.totalSearched}</p>
                    <p className="text-[10px] text-muted-foreground">Total Searched</p>
                  </div>
                </div>

                {/* By Type */}
                <div className="p-3 rounded-lg border bg-card space-y-2">
                  <Label className="text-xs font-semibold">By Type</Label>
                  {CACHE_TYPES.map((ct) => {
                    const count = geocaching.caches.filter((c) => c.type === ct.value).length
                    const found = geocaching.caches.filter((c) => c.type === ct.value && c.status === 'found').length
                    return (
                      <div key={ct.value} className="flex items-center gap-2 text-[10px]">
                        <ct.icon className={`h-3 w-3 ${ct.color}`} />
                        <span className="w-20">{ct.label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-lime-500 rounded-full"
                            style={{ width: count > 0 ? `${(found / count) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="w-12 text-right">{found}/{count}</span>
                      </div>
                    )
                  })}
                </div>

                {/* By Status */}
                <div className="p-3 rounded-lg border bg-card space-y-2">
                  <Label className="text-xs font-semibold">By Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CACHE_STATUSES.map((st) => {
                      const count = geocaching.caches.filter((c) => c.status === st.value).length
                      return (
                        <div key={st.value} className="flex items-center gap-1.5 text-[10px]">
                          <span className={`w-2 h-2 rounded-full ${st.color}`} />
                          <span>{st.label}: {count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Export */}
                <Button
                  variant="outline"
                  className="w-full h-8 text-xs gap-1.5"
                  onClick={handleExportGPX}
                  disabled={geocaching.caches.length === 0}
                >
                  <Download className="h-3.5 w-3.5" /> Export as GPX
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
