import { NextRequest, NextResponse } from 'next/server'

interface POI {
  name: string
  latitude: number
  longitude: number
  category: string
  type: string
  distance: number
  icon: string
}

// In-memory cache for POI results (similar to search route cache)
const poiCache = new Map<string, { data: { pois: POI[] }; timestamp: number }>()
const POI_CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const MAX_CACHE_SIZE = 100

function getPoiCacheKey(lat: number, lng: number, category: string): string {
  // Round to 3 decimal places (~111m precision) for better cache hits
  return `${lat.toFixed(3)},${lng.toFixed(3)},${category}`
}

function getPoiCached(key: string): { pois: POI[] } | null {
  const entry = poiCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > POI_CACHE_TTL) {
    poiCache.delete(key)
    return null
  }
  return entry.data
}

function setPoiCache(key: string, data: { pois: POI[] }) {
  // Evict old entries if cache is too large
  if (poiCache.size >= MAX_CACHE_SIZE) {
    const oldest = [...poiCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < Math.floor(MAX_CACHE_SIZE / 4); i++) {
      poiCache.delete(oldest[i][0])
    }
  }
  poiCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const category = searchParams.get('category') || 'eating_out'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Check cache first
  const cacheKey = getPoiCacheKey(latitude, longitude, category)
  const cached = getPoiCached(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  // Reduced radius for faster queries (3000 instead of 5000)
  const radius = 3000

  try {
    // Use Overpass API to find nearby POIs
    // Reduced timeout from 10 to 6 seconds
    const overpassQuery = buildOverpassQuery(latitude, longitude, category, radius)
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`

    const res = await fetch(overpassUrl, {
      headers: { 'User-Agent': 'MapLibreExplorer/1.0' },
      // Removed next: { revalidate: 300 } — it causes Next.js cache errors with large responses
      signal: AbortSignal.timeout(8000), // 8 second hard timeout for the fetch itself
    })

    if (res.ok) {
      const data = await res.json()
      const pois = (data.elements || [])
        .filter((el: Record<string, unknown>) => el.lat && el.lon)
        .slice(0, 15) // Limit results to 15 max
        .map((el: Record<string, unknown>) => {
          const tags = (el.tags || {}) as Record<string, string>
          const elLat = el.lat as number
          const elLon = el.lon as number
          const distance = haversineDistance(latitude, longitude, elLat, elLon)
          const poiCategory = categorizePOI(tags)
          return {
            name: tags.name || tags['name:en'] || getDefaultName(tags, category),
            latitude: elLat,
            longitude: elLon,
            category: poiCategory,
            type: tags.amenity || tags.tourism || tags.shop || tags.leisure || 'place',
            distance: Math.round(distance),
            icon: getPOIIcon(poiCategory),
          }
        })
        .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance)

      const result = { pois }
      setPoiCache(cacheKey, result)
      return NextResponse.json(result)
    }

    // Handle Overpass timeout errors specifically
    if (res.status === 429 || res.status === 504) {
      console.warn(`Overpass API returned ${res.status}, falling back to MapTiler`)
    }

    // Fallback: Use MapTiler Geocoding API with proximity
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
    if (maptilerKey) {
      const searchTerm = getCategorySearchTerm(category)
      const geocodeUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(searchTerm)}.json?proximity=${longitude},${latitude}&key=${maptilerKey}&limit=10`
      const geoRes = await fetch(geocodeUrl)

      if (geoRes.ok) {
        const geoData = await geoRes.json()
        const pois = (geoData.features || []).map((f: Record<string, unknown>) => {
          const center = f.center as number[] | undefined
          const placeType = f.place_type as string[] | undefined
          const poiLat = center?.[1] ?? latitude
          const poiLon = center?.[0] ?? longitude
          return {
            name: (f.text as string) || (f.place_name as string) || 'Unknown',
            latitude: poiLat,
            longitude: poiLon,
            category: category,
            type: placeType?.[0] || 'place',
            distance: Math.round(haversineDistance(latitude, longitude, poiLat, poiLon)),
            icon: getPOIIcon(category),
          }
        })
        const result = { pois }
        setPoiCache(cacheKey, result)
        return NextResponse.json(result)
      }
    }

    return NextResponse.json({ pois: [] })
  } catch (error) {
    // Handle Overpass timeout and network errors
    if (error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('abort'))) {
      console.warn('Overpass API request timed out, returning empty results')
      return NextResponse.json({ pois: [], warning: 'POI search timed out, please try again' })
    }
    console.error('POI search error:', error)
    return NextResponse.json({ error: 'Failed to search POIs', pois: [] }, { status: 500 })
  }
}

function buildOverpassQuery(lat: number, lng: number, category: string, radius: number): string {
  const categoryFilters: Record<string, string[]> = {
    eating_out: ['node["amenity"~"restaurant|cafe|bar|fast_food|pub|food_court"]', 'node["shop"~"bakery|butcher|convenience"]'],
    accommodation: ['node["tourism"~"hotel|motel|hostel|guest_house|chalet"]', 'way["tourism"~"hotel|motel|hostel|guest_house|chalet"]'],
    activity: ['node["leisure"~"park|playground|sports_centre|swimming_pool|fitness_centre|garden"]', 'way["leisure"~"park|garden|playground"]'],
    tourism: ['node["tourism"~"museum|attraction|viewpoint|artwork|gallery|information"]', 'way["tourism"~"museum|attraction|gallery"]', 'node["historic"]'],
    commercial: ['node["shop"~"supermarket|clothes|convenience|mall|department_store|electronics"]', 'way["shop"~"supermarket|mall|department_store"]'],
    cafe: ['node["amenity"~"cafe|coffee_shop"]', 'node["shop"~"coffee|tea"]'],
  }

  const filters = categoryFilters[category] || categoryFilters['eating_out']

  const queryParts = filters.map(filter =>
    `${filter}(around:${radius},${lat},${lng});`
  ).join('')

  // Reduced timeout from 10 to 6 seconds
  return `[out:json][timeout:6];(${queryParts});out body;`
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function categorizePOI(tags: Record<string, string>): string {
  if (tags.amenity?.match(/restaurant|cafe|bar|fast_food|pub|food_court/)) return 'eating_out'
  if (tags.shop?.match(/bakery|butcher|convenience/)) return 'eating_out'
  if (tags.tourism?.match(/hotel|motel|hostel|guest_house|chalet/)) return 'accommodation'
  if (tags.leisure) return 'activity'
  if (tags.tourism?.match(/museum|attraction|viewpoint|gallery/)) return 'tourism'
  if (tags.historic) return 'tourism'
  if (tags.shop) return 'commercial'
  if (tags.amenity?.match(/cafe|coffee_shop/)) return 'cafe'
  return 'place'
}

function getDefaultName(tags: Record<string, string>, category: string): string {
  const typeMap: Record<string, string> = {
    eating_out: 'Restaurant',
    accommodation: 'Hotel',
    activity: 'Activity',
    tourism: 'Attraction',
    commercial: 'Shop',
    cafe: 'Cafe',
  }
  const subtype = tags.amenity || tags.tourism || tags.shop || tags.leisure || ''
  if (subtype) {
    return subtype.charAt(0).toUpperCase() + subtype.slice(1).replace(/_/g, ' ')
  }
  return typeMap[category] || 'Place'
}

function getCategorySearchTerm(category: string): string {
  const searchTerms: Record<string, string> = {
    eating_out: 'restaurant',
    accommodation: 'hotel',
    activity: 'park',
    tourism: 'museum',
    commercial: 'shop',
    cafe: 'cafe',
  }
  return searchTerms[category] || 'restaurant'
}

function getPOIIcon(category: string): string {
  const icons: Record<string, string> = {
    eating_out: '🍽️',
    restaurant: '🍽️',
    accommodation: '🏨',
    hotel: '🏨',
    activity: '🎯',
    commercial: '🛍️',
    shop: '🛍️',
    education: '🎓',
    health: '🏥',
    hospital: '🏥',
    public_service: '🏛️',
    tourism: '🗺️',
    museum: '🏛️',
    park: '🌳',
    cafe: '☕',
    bar: '🍸',
    bank: '🏦',
    pharmacy: '💊',
    fuel: '⛽',
    parking: '🅿️',
    bus: '🚌',
    train: '🚉',
    airport: '✈️',
    poi: '📍',
    place: '📍',
    locality: '🏘️',
    region: '🌍',
    country: '🌐',
  }
  return icons[category] || '📍'
}
