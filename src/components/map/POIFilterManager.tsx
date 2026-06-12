'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  X,
  Save,
  Trash2,
  Download,
  RotateCcw,
  Search,
  Star,
  Clock,
  MapPin,
  Utensils,
  Coffee,
  Hotel,
  Heart,
  Fuel,
  ParkingCircle,
  Building2,
  GraduationCap,
  Drama,
  Bus,
  Dumbbell,
  Droplets,
  Toilet,
  TreePine,
  Landmark,
  ShoppingBag,
  Check,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  useMapStore,
  type POIFilters,
  type POIFilterPreset,
  type POIMarker,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const CATEGORY_OPTIONS = [
  { id: 'eating_out', label: 'Restaurants', icon: Utensils, color: 'bg-red-500' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: 'bg-amber-500' },
  { id: 'accommodation', label: 'Hotels', icon: Hotel, color: 'bg-purple-500' },
  { id: 'activity', label: 'Activities', icon: TreePine, color: 'bg-green-500' },
  { id: 'tourism', label: 'Tourism', icon: Landmark, color: 'bg-orange-500' },
  { id: 'commercial', label: 'Shops', icon: ShoppingBag, color: 'bg-sky-500' },
  { id: 'healthcare', label: 'Health', icon: Heart, color: 'bg-rose-500' },
  { id: 'fuel', label: 'Fuel', icon: Fuel, color: 'bg-yellow-600' },
  { id: 'parking', label: 'Parking', icon: ParkingCircle, color: 'bg-blue-500' },
  { id: 'banking', label: 'Banking', icon: Building2, color: 'bg-emerald-600' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'bg-violet-500' },
  { id: 'entertainment', label: 'Fun', icon: Drama, color: 'bg-pink-500' },
  { id: 'public_transport', label: 'Transit', icon: Bus, color: 'bg-teal-500' },
  { id: 'sports', label: 'Sports', icon: Dumbbell, color: 'bg-lime-500' },
  { id: 'drinking_water', label: 'Water', icon: Droplets, color: 'bg-cyan-500' },
  { id: 'toilets', label: 'Toilets', icon: Toilet, color: 'bg-gray-500' },
]

const QUICK_FILTER_CHIPS = [
  { id: 'open-now', label: 'Open Now', icon: Clock },
  { id: 'top-rated', label: 'Top Rated', icon: Star },
  { id: 'nearby', label: 'Within 1km', icon: MapPin },
  { id: 'food-drink', label: 'Food & Drink', icon: Utensils },
  { id: 'essentials', label: 'Essentials', icon: Fuel },
]

export function POIFilterManager() {
  const {
    poiFilters,
    setPOIFilters,
    resetPOIFilters,
    poiFilterPresets,
    addPOIFilterPreset,
    deletePOIFilterPreset,
    loadPOIFilterPreset,
    poiMarkers,
  } = useMapStore()

  const [presetName, setPresetName] = useState('')
  const [showPresetSave, setShowPresetSave] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Compute matching POI count
  const matchingCount = useMemo(() => {
    if (!poiMarkers || poiMarkers.length === 0) return 0

    let filtered = poiMarkers

    // Category filter
    if (poiFilters.categories.length > 0) {
      filtered = filtered.filter((poi) => poiFilters.categories.includes(poi.category))
    }

    // Keyword filter
    if (poiFilters.keyword.trim()) {
      const q = poiFilters.keyword.toLowerCase()
      filtered = filtered.filter((poi) => poi.name.toLowerCase().includes(q))
    }

    // Distance filter
    if (poiFilters.radiusKm < 5 && poiFilters.radiusKm > 0) {
      const maxDist = poiFilters.radiusKm * 1000
      filtered = filtered.filter(
        (poi) => poi.distance === null || poi.distance <= maxDist
      )
    }

    return filtered.length
  }, [poiMarkers, poiFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (poiFilters.categories.length > 0) count++
    if (poiFilters.radiusKm < 5) count++
    if (poiFilters.openNowOnly) count++
    if (poiFilters.keyword.trim()) count++
    if (poiFilters.minRating > 0) count++
    return count
  }, [poiFilters])

  const toggleCategory = useCallback(
    (categoryId: string) => {
      const current = poiFilters.categories
      if (current.includes(categoryId)) {
        setPOIFilters({ categories: current.filter((c) => c !== categoryId) })
      } else {
        setPOIFilters({ categories: [...current, categoryId] })
      }
    },
    [poiFilters.categories, setPOIFilters]
  )

  const handleQuickFilter = useCallback(
    (chipId: string) => {
      switch (chipId) {
        case 'open-now':
          setPOIFilters({ openNowOnly: !poiFilters.openNowOnly })
          break
        case 'top-rated':
          setPOIFilters({ minRating: poiFilters.minRating > 0 ? 0 : 4 })
          break
        case 'nearby':
          setPOIFilters({ radiusKm: poiFilters.radiusKm <= 1 ? 5 : 1 })
          break
        case 'food-drink':
          if (
            poiFilters.categories.includes('eating_out') &&
            poiFilters.categories.includes('cafe')
          ) {
            setPOIFilters({
              categories: poiFilters.categories.filter(
                (c) => c !== 'eating_out' && c !== 'cafe'
              ),
            })
          } else {
            const cats = [...new Set([...poiFilters.categories, 'eating_out', 'cafe'])]
            setPOIFilters({ categories: cats })
          }
          break
        case 'essentials':
          if (
            poiFilters.categories.includes('fuel') &&
            poiFilters.categories.includes('healthcare')
          ) {
            setPOIFilters({
              categories: poiFilters.categories.filter(
                (c) => c !== 'fuel' && c !== 'healthcare' && c !== 'parking'
              ),
            })
          } else {
            const cats = [
              ...new Set([...poiFilters.categories, 'fuel', 'healthcare', 'parking']),
            ]
            setPOIFilters({ categories: cats })
          }
          break
      }
    },
    [poiFilters, setPOIFilters]
  )

  const isQuickFilterActive = useCallback(
    (chipId: string): boolean => {
      switch (chipId) {
        case 'open-now':
          return poiFilters.openNowOnly
        case 'top-rated':
          return poiFilters.minRating > 0
        case 'nearby':
          return poiFilters.radiusKm <= 1
        case 'food-drink':
          return (
            poiFilters.categories.includes('eating_out') &&
            poiFilters.categories.includes('cafe')
          )
        case 'essentials':
          return (
            poiFilters.categories.includes('fuel') &&
            poiFilters.categories.includes('healthcare')
          )
        default:
          return false
      }
    },
    [poiFilters]
  )

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }
    const preset: POIFilterPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: presetName.trim(),
      filters: { ...poiFilters },
    }
    addPOIFilterPreset(preset)
    setPresetName('')
    setShowPresetSave(false)
    toast.success(`Preset "${preset.name}" saved`)
  }, [presetName, poiFilters, addPOIFilterPreset])

  const handleLoadPreset = useCallback(
    (id: string) => {
      loadPOIFilterPreset(id)
      toast.success('Preset loaded')
    },
    [loadPOIFilterPreset]
  )

  const handleDeletePreset = useCallback(
    (id: string) => {
      deletePOIFilterPreset(id)
      toast.success('Preset deleted')
    },
    [deletePOIFilterPreset]
  )

  const handleExportGeoJSON = useCallback(() => {
    if (!poiMarkers || poiMarkers.length === 0) {
      toast.error('No POIs to export')
      return
    }

    let filtered = poiMarkers

    if (poiFilters.categories.length > 0) {
      filtered = filtered.filter((poi) => poiFilters.categories.includes(poi.category))
    }
    if (poiFilters.keyword.trim()) {
      const q = poiFilters.keyword.toLowerCase()
      filtered = filtered.filter((poi) => poi.name.toLowerCase().includes(q))
    }
    if (poiFilters.radiusKm < 5 && poiFilters.radiusKm > 0) {
      const maxDist = poiFilters.radiusKm * 1000
      filtered = filtered.filter(
        (poi) => poi.distance === null || poi.distance <= maxDist
      )
    }

    const geojson = {
      type: 'FeatureCollection' as const,
      features: filtered.map((poi) => ({
        type: 'Feature' as const,
        properties: {
          name: poi.name,
          category: poi.category,
          icon: poi.icon,
          distance: poi.distance,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [poi.longitude, poi.latitude],
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/geo+json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'poi-filtered.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filtered.length} POIs`)
  }, [poiMarkers, poiFilters])

  const handleResetAll = useCallback(() => {
    resetPOIFilters()
    toast.success('Filters reset')
  }, [resetPOIFilters])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-1.5 text-xs',
            activeFilterCount > 0
              ? 'text-primary bg-primary/10 hover:bg-primary/15'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Open POI filters"
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 px-1 text-[9px] bg-primary/20 text-primary"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" />
            POI Filters
            {matchingCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                {matchingCount} results
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-4 pb-4">
          <div className="space-y-4 py-2">
            {/* Quick Filter Chips */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Quick Filters</p>
              <div className="flex gap-1.5 flex-wrap">
                {QUICK_FILTER_CHIPS.map((chip) => {
                  const active = isQuickFilterActive(chip.id)
                  return (
                    <button
                      key={chip.id}
                      onClick={() => handleQuickFilter(chip.id)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all border',
                        active
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <chip.icon className="h-3 w-3" />
                      {chip.label}
                      {active && <Check className="h-2.5 w-2.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Category Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Categories</p>
                {poiFilters.categories.length > 0 && (
                  <button
                    onClick={() => setPOIFilters({ categories: [] })}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear ({poiFilters.categories.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isActive = poiFilters.categories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all border',
                        isActive
                          ? 'bg-primary/8 border-primary/20 text-foreground'
                          : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-accent'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors',
                          isActive ? cat.color : 'bg-muted/50'
                        )}
                      >
                        <cat.icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="truncate">{cat.label}</span>
                      {isActive && (
                        <Check className="h-3 w-3 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Distance Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Distance Radius
                </p>
                <span className="text-xs font-medium tabular-nums">
                  {poiFilters.radiusKm >= 5 ? 'All' : `${poiFilters.radiusKm.toFixed(1)} km`}
                </span>
              </div>
              <Slider
                value={[poiFilters.radiusKm]}
                min={0.5}
                max={5}
                step={0.5}
                onValueChange={([value]) => setPOIFilters({ radiusKm: value })}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>0.5 km</span>
                <span>5 km (all)</span>
              </div>
            </div>

            <Separator />

            {/* Opening Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Open Now Only
                  </p>
                </div>
                <Switch
                  checked={poiFilters.openNowOnly}
                  onCheckedChange={(checked) => setPOIFilters({ openNowOnly: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* Min Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Minimum Rating
                  </p>
                </div>
                <span className="text-xs font-medium tabular-nums">
                  {poiFilters.minRating === 0 ? 'Any' : `${poiFilters.minRating}+`}
                </span>
              </div>
              <Slider
                value={[poiFilters.minRating]}
                min={0}
                max={5}
                step={1}
                onValueChange={([value]) => setPOIFilters({ minRating: value })}
                className="py-2"
              />
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setPOIFilters({ minRating: v })}
                    className={cn(
                      'flex-1 text-center text-[10px] py-0.5 rounded transition-colors',
                      poiFilters.minRating === v
                        ? 'text-primary font-medium bg-primary/10'
                        : 'text-muted-foreground/60 hover:text-foreground'
                    )}
                  >
                    {v === 0 ? 'Any' : `${v}+`}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Keyword Search */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Keyword Search</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={poiFilters.keyword}
                  onChange={(e) => setPOIFilters({ keyword: e.target.value })}
                  placeholder="Search POI names..."
                  className="h-8 pl-8 pr-8 text-xs"
                />
                {poiFilters.keyword && (
                  <button
                    onClick={() => setPOIFilters({ keyword: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <Separator />

            {/* Saved Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Saved Presets</p>
                <button
                  onClick={() => setShowPresetSave(!showPresetSave)}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Save Current
                </button>
              </div>

              <AnimatePresence>
                {showPresetSave && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-1.5">
                      <Input
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Preset name..."
                        className="h-7 text-xs flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePreset()
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={handleSavePreset}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {poiFilterPresets.length > 0 ? (
                <div className="space-y-1">
                  {poiFilterPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 hover:bg-accent/50 transition-colors group"
                    >
                      <button
                        onClick={() => handleLoadPreset(preset.id)}
                        className="flex-1 text-left text-xs font-medium truncate"
                      >
                        {preset.name}
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {preset.filters.categories.length} cat
                        </Badge>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors"
                          aria-label="Delete preset"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/50 text-center py-2">
                  No saved presets yet
                </p>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={handleResetAll}
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={handleExportGeoJSON}
              >
                <Download className="h-3 w-3" />
                Export GeoJSON
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
