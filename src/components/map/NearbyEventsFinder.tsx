'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMapStore, type NearbyEvent } from '@/lib/map-store'
import { CalendarDays, MapPin, Clock, Star, Navigation, Loader2, Search, ExternalLink, Plus } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_CATEGORIES = [
  { id: 'concert', name: 'Concerts', icon: '🎵', color: '#8b5cf6' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#22c55e' },
  { id: 'festival', name: 'Festivals', icon: '🎪', color: '#f59e0b' },
  { id: 'market', name: 'Markets', icon: '🛒', color: '#ef4444' },
  { id: 'exhibition', name: 'Exhibitions', icon: '🎨', color: '#06b6d4' },
  { id: 'conference', name: 'Conferences', icon: '🎤', color: '#3b82f6' },
]

const DATE_FILTERS = [
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'all', name: 'All Upcoming' },
]

// Simulate generating plausible event data from POI data
function generateEventsFromPOIs(
  pois: Array<{ name: string; lat: number; lon: number; tags: Record<string, string> }>,
  centerLat: number,
  centerLng: number,
  radius: number
): NearbyEvent[] {
  const events: NearbyEvent[] = []
  const now = new Date()

  const venueTypes: Record<string, string[]> = {
    concert: ['theatre', 'music_venue', 'nightclub', 'arts_centre', 'cinema'],
    sports: ['stadium', 'sports_centre', 'pitch', 'sports_hall', 'swimming_pool'],
    festival: ['park', 'garden', 'square', 'plaza', 'arts_centre'],
    market: ['marketplace', 'supermarket', 'shop', 'commercial'],
    exhibition: ['museum', 'gallery', 'arts_centre', 'library', 'exhibition_centre'],
    conference: ['conference_centre', 'hotel', 'university', 'townhall', 'office'],
  }

  const eventNames: Record<string, string[]> = {
    concert: ['Live Music Night', 'Acoustic Sessions', 'Symphony Orchestra', 'Jazz Evening', 'Rock Concert', 'Classical Recital', 'Open Mic Night', 'Band Performance'],
    sports: ['Local Tournament', 'Fitness Challenge', 'Marathon Training', 'Swimming Gala', 'Football Match', 'Basketball Game', 'Yoga in the Park', 'Cross Country Run'],
    festival: ['Cultural Festival', 'Food Festival', 'Street Fair', 'Art Festival', 'Music Festival', 'Heritage Day', 'Community Celebration', 'Seasonal Fair'],
    market: ['Farmers Market', 'Craft Market', 'Flea Market', 'Night Market', 'Artisan Market', 'Vintage Market', 'Organic Market', 'Holiday Market'],
    exhibition: ['Art Exhibition', 'Photo Gallery', 'Science Exhibition', 'History Display', 'Modern Art Show', 'Sculpture Garden', 'Digital Art Expo', 'Design Showcase'],
    conference: ['Tech Conference', 'Business Summit', 'Workshop Day', 'Networking Event', 'Innovation Forum', 'TEDx Talk', 'Industry Meetup', 'Startup Pitch'],
  }

  const descriptions: Record<string, string[]> = {
    concert: ['An evening of wonderful live performances.', 'Featuring local and international artists.', 'Doors open at 7 PM, show starts at 8 PM.', 'Enjoy an unforgettable night of music.'],
    sports: ['Join fellow sports enthusiasts for an exciting event.', 'All skill levels welcome.', 'Registration starts at 8 AM.', 'Bring your A-game!'],
    festival: ['Celebrate with the community at this vibrant festival.', 'Food, music, and fun for the whole family.', 'Free admission, donations welcome.', 'A celebration of local culture and heritage.'],
    market: ['Discover unique local products and fresh produce.', 'Support local vendors and artisans.', 'Open from 9 AM to 5 PM.', 'Cash and card payments accepted.'],
    exhibition: ['Explore fascinating displays and installations.', 'Guided tours available at 11 AM and 3 PM.', 'Featuring works by emerging and established artists.', 'Free entry on weekdays.'],
    conference: ['Connect with industry leaders and innovators.', 'Keynote speakers and breakout sessions.', 'Early bird tickets available.', 'Lunch and refreshments provided.'],
  }

  for (const poi of pois) {
    const name = poi.tags.name || poi.tags['name:en'] || 'Unknown Venue'
    const amenity = poi.tags.amenity || ''
    const leisure = poi.tags.leisure || ''
    const tourism = poi.tags.tourism || ''
    const shop = poi.tags.shop || ''
    const building = poi.tags.building || ''

    const allTags = [amenity, leisure, tourism, shop, building].filter(Boolean)

    let bestCategory = 'exhibition'
    let bestScore = 0

    for (const [cat, types] of Object.entries(venueTypes)) {
      const score = allTags.reduce((acc, tag) => acc + (types.includes(tag) ? 1 : 0), 0)
      if (score > bestScore) {
        bestScore = score
        bestCategory = cat
      }
    }

    if (bestScore === 0) {
      const categories = Object.keys(venueTypes)
      bestCategory = categories[Math.floor(Math.random() * categories.length)]
    }

    const distance = haversineDistance(centerLat, centerLng, poi.lat, poi.lon)
    if (distance > radius) continue

    const numEvents = 1 + Math.floor(Math.random() * 3)
    for (let i = 0; i < numEvents; i++) {
      const catNames = eventNames[bestCategory]
      const catDescs = descriptions[bestCategory]
      const daysOffset = Math.floor(Math.random() * 30)
      const eventDate = new Date(now.getTime() + daysOffset * 86400000)
      const hours = 9 + Math.floor(Math.random() * 12)
      eventDate.setHours(hours, Math.random() > 0.5 ? 0 : 30, 0, 0)

      events.push({
        id: `evt-${poi.lat.toFixed(4)}-${poi.lon.toFixed(4)}-${i}`,
        name: catNames[Math.floor(Math.random() * catNames.length)],
        venue: name,
        category: bestCategory,
        date: eventDate.toISOString(),
        description: catDescs[Math.floor(Math.random() * catDescs.length)],
        latitude: poi.lat,
        longitude: poi.lon,
        distance: Math.round(distance * 10) / 10,
      })
    }
  }

  return events.sort((a, b) => a.distance - b.distance)
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getTimeUntil(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()

  if (diff < 0) return 'Started'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function NearbyEventsFinder() {
  const eventsFinderOpen = useMapStore((s) => s.eventsFinderOpen)
  const setEventsFinderOpen = useMapStore((s) => s.setEventsFinderOpen)
  const nearbyEvents = useMapStore((s) => s.nearbyEvents)
  const setNearbyEvents = useMapStore((s) => s.setNearbyEvents)
  const eventSearchRadius = useMapStore((s) => s.eventSearchRadius)
  const setEventSearchRadius = useMapStore((s) => s.setEventSearchRadius)
  const center = useMapStore((s) => s.center)
  const addSavedLocation = useMapStore((s) => s.addSavedLocation)

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [eventMarkers, setEventMarkers] = useState<Array<{ id: string; lat: number; lng: number; color: string }>>([])
  const markersRef = useRef<Array<{ id: string; lat: number; lng: number; color: string }>>([])

  // Clean up markers when dialog closes
  useEffect(() => {
    if (!eventsFinderOpen) {
      removeEventMarkers()
    }
  }, [eventsFinderOpen])

  const removeEventMarkers = useCallback(() => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    for (const marker of markersRef.current) {
      const el = document.getElementById(marker.id)
      if (el) el.remove()
    }
    markersRef.current = []
    setEventMarkers([])
  }, [])

  const addEventMarkersToMap = useCallback(
    (events: NearbyEvent[]) => {
      if (typeof window === 'undefined') return
      const map = (window as any).__mainMap
      if (!map) return

      removeEventMarkers()

      const newMarkers: Array<{ id: string; lat: number; lng: number; color: string }> = []
      const categoryInfo = EVENT_CATEGORIES.reduce(
        (acc, cat) => {
          acc[cat.id] = cat
          return acc
        },
        {} as Record<string, (typeof EVENT_CATEGORIES)[0]>
      )

      for (const event of events.slice(0, 50)) {
        const cat = categoryInfo[event.category] ?? EVENT_CATEGORIES[4]
        const markerId = `event-marker-${event.id}`

        const el = document.createElement('div')
        el.id = markerId
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: ${cat.color}; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer; transition: transform 0.2s;
        `
        el.textContent = cat.icon
        el.title = event.name

        try {
          const maplibregl = (window as any).maplibregl
          if (maplibregl) {
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([event.longitude, event.latitude])
              .setPopup(
                new maplibregl.Popup({ offset: 14 }).setHTML(
                  `<div style="padding:8px;max-width:200px;">
                    <div style="font-weight:bold;font-size:13px;margin-bottom:4px;">${event.name}</div>
                    <div style="font-size:11px;color:#666;">${cat.icon} ${cat.name} · ${event.venue}</div>
                    <div style="font-size:11px;color:#888;margin-top:2px;">${formatDate(event.date)}</div>
                    <div style="font-size:11px;color:#888;">${event.distance} km away</div>
                  </div>`
                )
              )
              .addTo(map)

            const markerData = { id: markerId, lat: event.latitude, lng: event.longitude, color: cat.color }
            newMarkers.push(markerData)
            markersRef.current.push(markerData)
          }
        } catch {
          // Marker creation failed, skip
        }
      }

      setEventMarkers(newMarkers)
    },
    [removeEventMarkers]
  )

  const searchEvents = useCallback(async () => {
    if (typeof window === 'undefined') return

    setLoading(true)
    const [lng, lat] = center

    try {
      const radiusMeters = eventSearchRadius * 1000
      const overpassUrl = 'https://overpass-api.de/api/interpreter'
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"theatre|cinema|arts_centre|conference_centre|events_venue|music_venue|nightclub|stadium|sports_centre|swimming_pool|university|townhall"](around:${radiusMeters},${lat},${lng});
          node["leisure"~"park|garden|sports_centre|pitch|stadium"](around:${radiusMeters},${lat},${lng});
          node["tourism"~"museum|gallery|artwork|attraction"](around:${radiusMeters},${lat},${lng});
          node["shop"~"marketplace"](around:${radiusMeters},${lat},${lng});
          way["amenity"~"theatre|cinema|arts_centre|conference_centre|events_venue|music_venue|stadium|sports_centre"](around:${radiusMeters},${lat},${lng});
          way["leisure"~"park|garden|sports_centre"](around:${radiusMeters},${lat},${lng});
          way["tourism"~"museum|gallery|attraction"](around:${radiusMeters},${lat},${lng});
        );
        out center 50;
      `

      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
      })

      if (!response.ok) {
        throw new Error('Overpass API request failed')
      }

      const data = await response.json()
      const pois = (data.elements || [])
        .filter((el: any) => el.lat && el.lon)
        .map((el: any) => ({
          name: el.tags?.name || el.tags?.['name:en'] || 'Venue',
          lat: el.lat,
          lon: el.lon,
          tags: el.tags || {},
        }))

      const events = generateEventsFromPOIs(pois, lat, lng, eventSearchRadius)
      setNearbyEvents(events)
      addEventMarkersToMap(events)

      if (events.length === 0) {
        toast.info('No events found in this area. Try increasing the search radius.')
      } else {
        toast.success(`Found ${events.length} nearby events!`)
      }
    } catch (error) {
      console.error('Event search error:', error)
      // Fallback: generate simulated events
      const fallbackPois = Array.from({ length: 15 }, (_, i) => ({
        name: `Venue ${i + 1}`,
        lat: lat + (Math.random() - 0.5) * 0.04,
        lon: lng + (Math.random() - 0.5) * 0.04,
        tags: {
          amenity: ['theatre', 'stadium', 'museum', 'conference_centre', 'sports_centre', 'nightclub'][i % 6],
          name: ['Grand Theatre', 'City Stadium', 'National Museum', 'Convention Center', 'Sports Arena', 'Jazz Club', 'Art Gallery', 'Heritage Hall', 'Open Air Stage', 'Community Center', 'Rooftop Venue', 'The Gallery', 'Town Square', 'Waterfront Hall', 'Botanical Garden'][i],
        },
      }))

      const events = generateEventsFromPOIs(fallbackPois, lat, lng, eventSearchRadius)
      setNearbyEvents(events)
      addEventMarkersToMap(events)
      toast.success(`Found ${events.length} simulated events!`)
    } finally {
      setLoading(false)
    }
  }, [center, eventSearchRadius, setNearbyEvents, addEventMarkersToMap])

  const navigateToEvent = useCallback((event: NearbyEvent) => {
    if (typeof window === 'undefined') return
    const map = (window as any).__mainMap
    if (!map) return

    map.flyTo({
      center: [event.longitude, event.latitude],
      zoom: 16,
      duration: 1500,
    })
    setEventsFinderOpen(false)
    toast.info(`Navigating to ${event.name}`)
  }, [setEventsFinderOpen])

  const addEventVenueToSaved = useCallback(
    (event: NearbyEvent) => {
      const cat = EVENT_CATEGORIES.find((c) => c.id === event.category)
      addSavedLocation({
        id: `saved-evt-${event.id}`,
        name: event.venue,
        description: `Venue for: ${event.name}`,
        latitude: event.latitude,
        longitude: event.longitude,
        category: event.category,
        color: cat?.color ?? '#888888',
        icon: cat?.icon ?? '📍',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast.success(`Added "${event.venue}" to saved locations`)
    },
    [addSavedLocation]
  )

  // Filter events
  const filteredEvents = nearbyEvents.filter((event) => {
    if (selectedCategory && event.category !== selectedCategory) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !event.name.toLowerCase().includes(q) &&
        !event.venue.toLowerCase().includes(q) &&
        !event.description.toLowerCase().includes(q)
      )
        return false
    }

    if (dateFilter !== 'all') {
      const eventDate = new Date(event.date)
      const now = new Date()
      if (dateFilter === 'today') {
        if (eventDate.toDateString() !== now.toDateString()) return false
      } else if (dateFilter === 'week') {
        const weekEnd = new Date(now.getTime() + 7 * 86400000)
        if (eventDate > weekEnd) return false
      } else if (dateFilter === 'month') {
        const monthEnd = new Date(now.getTime() + 30 * 86400000)
        if (eventDate > monthEnd) return false
      }
    }

    return true
  })

  // Featured venues (most events)
  const venueCounts = filteredEvents.reduce(
    (acc, event) => {
      acc[event.venue] = (acc[event.venue] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const popularVenues = Object.entries(venueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Category counts
  const categoryCounts = filteredEvents.reduce(
    (acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Next upcoming event
  const nextEvent = filteredEvents.length > 0
    ? filteredEvents.reduce((earliest, event) => {
        const eventDate = new Date(event.date)
        const earliestDate = new Date(earliest.date)
        return eventDate < earliestDate ? event : earliest
      })
    : null

  return (
    <Dialog open={eventsFinderOpen} onOpenChange={setEventsFinderOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-500" />
            Nearby Events Finder
          </DialogTitle>
          <DialogDescription>
            Discover events and activities near the current map view. Search by category, radius, and date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search Controls */}
          <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, venues..."
                  className="h-9 text-sm"
                />
              </div>
              <Button
                size="sm"
                className="h-9 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={searchEvents}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-1" />
                )}
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Radius */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Search Radius: {eventSearchRadius} km
              </Label>
              <Slider
                value={[eventSearchRadius]}
                onValueChange={([v]) => setEventSearchRadius(v)}
                min={1}
                max={50}
                step={1}
              />
            </div>

            {/* Date Filter */}
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={dateFilter === f.id ? 'default' : 'outline'}
                  className={`h-7 text-xs ${
                    dateFilter === f.id ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                  }`}
                  onClick={() => setDateFilter(f.id)}
                >
                  {f.name}
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                className={`h-7 text-xs ${
                  selectedCategory === null ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {EVENT_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className={`h-7 text-xs gap-1 ${
                    selectedCategory === cat.id ? 'text-white' : ''
                  }`}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  {cat.icon} {cat.name}
                  {categoryCounts[cat.id] ? (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                      {categoryCounts[cat.id]}
                    </Badge>
                  ) : null}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured: Next Event Countdown */}
          {nextEvent && (
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Next Event</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{nextEvent.name}</div>
                  <div className="text-xs text-muted-foreground">{nextEvent.venue} · {nextEvent.distance} km</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-600">{getTimeUntil(nextEvent.date)}</div>
                  <div className="text-[10px] text-muted-foreground">{formatDate(nextEvent.date)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Popular Venues */}
          {popularVenues.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium">Popular Venues</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularVenues.map(([venue, count]) => (
                  <Badge key={venue} variant="secondary" className="text-[11px] gap-1">
                    {venue}
                    <span className="text-amber-600 font-medium">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
              {nearbyEvents.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] text-muted-foreground"
                  onClick={() => {
                    setNearbyEvents([])
                    removeEventMarkers()
                  }}
                >
                  Clear Results
                </Button>
              )}
            </div>

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No events found</p>
                <p className="text-xs mt-1">Try adjusting the search radius or category filter</p>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {filteredEvents.map((event) => {
                const cat = EVENT_CATEGORIES.find((c) => c.id === event.category) ?? EVENT_CATEGORIES[4]
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-border hover:border-amber-300 transition-all group cursor-pointer"
                    onClick={() => navigateToEvent(event)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{event.name}</span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                          <span className="shrink-0">· {event.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{formatDate(event.date)}</span>
                          <span className="shrink-0">· {getTimeUntil(event.date)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToEvent(event)
                          }}
                          title="Navigate to event"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            addEventVenueToSaved(event)
                          }}
                          title="Save venue"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          {eventMarkers.length > 0 && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{eventMarkers.length} markers on map</span>
              <span>·</span>
              <span>Click marker for details</span>
              <span>·</span>
              <button
                onClick={removeEventMarkers}
                className="text-destructive hover:underline"
              >
                Remove markers
              </button>
            </div>
          )}

          {/* Info */}
          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium">About</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Events are discovered from OpenStreetMap venue data via the Overpass API and simulated with
              plausible event details. Click any event to navigate to its location on the map.
              Save venues to your locations for quick access.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
