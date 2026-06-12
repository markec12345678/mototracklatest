'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Search,
  Clock,
  Navigation,
  Filter,
  ChevronDown,
  ChevronRight,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type SavedLocation } from '@/lib/map-store'
import { cn } from '@/lib/utils'

/** Category icon mapping */
const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  hotel: '🏨',
  gas_station: '⛽',
  parking: '🅿️',
  hospital: '🏥',
  pharmacy: '💊',
  bank: '🏦',
  atm: '🏧',
  school: '🎓',
  university: '🎓',
  entertainment: '🎭',
  cinema: '🎬',
  bus_station: '🚌',
  train_station: '🚂',
  airport: '✈️',
  sports: '⚽',
  park: '🌳',
  museum: '🏛️',
  church: '⛪',
  mosque: '🕌',
  temple: '🛕',
  shopping: '🛍️',
  grocery: '🛒',
  landmark: '🗽',
  viewpoint: '🏔️',
  nature: '🌿',
  water: '💧',
  toilet: '🚻',
  default: '📍',
}

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default
}

/** Group dates into human-readable buckets */
type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Older'

function getDateGroup(dateStr: string): DateGroup {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const monthAgo = new Date(today.getTime() - 30 * 86400000)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'This Week'
  if (date >= monthAgo) return 'This Month'
  return 'Older'
}

const GROUP_ORDER: DateGroup[] = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface GroupedLocations {
  group: DateGroup
  locations: SavedLocation[]
}

export function LocationHistoryTimeline() {
  const savedLocations = useMapStore((s) => s.savedLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<DateGroup>>(new Set())

  // Get unique categories from saved locations
  const categories = useMemo(() => {
    const cats = new Set<string>()
    savedLocations.forEach((loc) => cats.add(loc.category))
    return Array.from(cats).sort()
  }, [savedLocations])

  // Filter and group locations
  const groupedLocations = useMemo(() => {
    let filtered = savedLocations

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.description?.toLowerCase().includes(q) ||
          loc.category.toLowerCase().includes(q)
      )
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter((loc) => loc.category === filterCategory)
    }

    // Sort by date (newest first)
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Group by date
    const groups: GroupedLocations[] = []
    const groupMap = new Map<DateGroup, SavedLocation[]>()

    for (const loc of filtered) {
      const group = getDateGroup(loc.createdAt)
      if (!groupMap.has(group)) {
        groupMap.set(group, [])
      }
      groupMap.get(group)!.push(loc)
    }

    for (const group of GROUP_ORDER) {
      const locations = groupMap.get(group)
      if (locations && locations.length > 0) {
        groups.push({ group, locations })
      }
    }

    return groups
  }, [savedLocations, searchQuery, filterCategory])

  const toggleGroup = useCallback((group: DateGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }, [])

  const flyToLocation = useCallback((loc: SavedLocation) => {
    if (typeof window === 'undefined') return
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(loc.longitude, loc.latitude, 14)
    }
  }, [])

  const totalCount = groupedLocations.reduce((sum, g) => sum + g.locations.length, 0)

  if (savedLocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">No saved locations yet</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          Save places to see them in your history timeline
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search history..."
          className="h-8 text-xs pl-8 pr-8 rounded-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <span className="text-xs">×</span>
          </button>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterCategory(null)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-md transition-colors border',
                !filterCategory
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              )}
            >
              All ({savedLocations.length})
            </button>
            {categories.map((cat) => {
              const count = savedLocations.filter((l) => l.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-md transition-colors border',
                    filterCategory === cat
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                  )}
                >
                  {getCategoryIcon(cat)} {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {totalCount} location{totalCount !== 1 ? 's' : ''}
          {filterCategory && ` in ${filterCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
      </div>

      {/* Timeline */}
      <ScrollArea className="max-h-80">
        <div className="space-y-1">
          {groupedLocations.map(({ group, locations }) => {
            const isCollapsed = collapsedGroups.has(group)
            return (
              <div key={group}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium">{group}</span>
                  <Badge
                    variant="secondary"
                    className="text-[8px] px-1.5 py-0 h-4 ml-auto shrink-0"
                  >
                    {locations.length}
                  </Badge>
                </button>

                {/* Group items */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-2 border-l-2 border-muted/50 pl-0">
                        {locations.map((loc, idx) => (
                          <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15, delay: idx * 0.03 }}
                            className="relative flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/30 transition-colors group cursor-pointer"
                            onClick={() => flyToLocation(loc)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') flyToLocation(loc)
                            }}
                            aria-label={`Fly to ${loc.name}`}
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-[5px] top-1/2 -translate-y-1/2">
                              <div
                                className="w-2.5 h-2.5 rounded-full border-2 border-background"
                                style={{ backgroundColor: loc.color }}
                              />
                            </div>

                            {/* Category icon */}
                            <span className="text-sm shrink-0 ml-2">
                              {getCategoryIcon(loc.category)}
                            </span>

                            {/* Location info */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">{loc.name}</div>
                              <div className="text-[10px] text-muted-foreground tabular-nums">
                                {formatTimestamp(loc.createdAt)}
                              </div>
                            </div>

                            {/* Fly-to button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                flyToLocation(loc)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-accent transition-all shrink-0"
                              aria-label={`Fly to ${loc.name}`}
                            >
                              <Navigation className="h-3 w-3 text-primary" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {groupedLocations.length === 0 && (
            <div className="flex flex-col items-center py-4 text-center">
              <MapPin className="h-5 w-5 text-muted-foreground/40 mb-1.5" />
              <p className="text-[10px] text-muted-foreground">No matching locations</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
