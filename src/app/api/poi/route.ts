import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const category = searchParams.get('category') || 'eating_out'
  const radius = parseInt(searchParams.get('radius') || '5000')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    // Use Overpass API to find nearby POIs
    // Build the Overpass QL query based on category
    const overpassQuery = buildOverpassQuery(latitude, longitude, category, radius)
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`

    const res = await fetch(overpassUrl, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'MapLibreExplorer/1.0' },
    })

    if (res.ok) {
      const data = await res.json()
      const pois = (data.elements || [])
        .filter((el: Record<string, unknown>) => el.lat && el.lon)
        .slice(0, 20)
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

      return NextResponse.json({ pois })
    }

    // Fallback: Use MapTiler Geocoding API with proximity
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
    if (maptilerKey) {
      const searchTerm = getCategorySearchTerm(category)
      const geocodeUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(searchTerm)}.json?proximity=${longitude},${latitude}&key=${maptilerKey}&limit=10`
      const geoRes = await fetch(geocodeUrl, { next: { revalidate: 300 } })

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
        return NextResponse.json({ pois })
      }
    }

    return NextResponse.json({ pois: [] })
  } catch (error) {
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

  return `[out:json][timeout:10];(${queryParts});out body;`
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
