import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for reverse geocoding results
type CacheEntry = { data: unknown; timestamp: number }
const reverseGeocodeCache = new Map<string, CacheEntry>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const MAX_CACHE_SIZE = 100

function getCached(key: string): unknown | null {
  const entry = reverseGeocodeCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    reverseGeocodeCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: unknown) {
  if (reverseGeocodeCache.size >= MAX_CACHE_SIZE) {
    const oldest = [...reverseGeocodeCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < Math.floor(MAX_CACHE_SIZE / 4); i++) {
      reverseGeocodeCache.delete(oldest[i][0])
    }
  }
  reverseGeocodeCache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng parameters are required' }, { status: 400 })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 })
    }

    // Check cache
    const cacheKey = `reverse:${latitude.toFixed(3)},${longitude.toFixed(3)}`
    const cached = getCached(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Try MapTiler reverse geocoding
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
    if (maptilerKey) {
      try {
        const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${maptilerKey}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: 3600 },
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const place = data.features[0]
            const result = {
              name: place.text || place.place_name?.split(',')[0] || `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
              fullName: place.place_name || place.text,
              latitude,
              longitude,
              type: Array.isArray(place.place_type) ? place.place_type[0] : 'place',
            }
            setCache(cacheKey, result)
            return NextResponse.json(result)
          }
        }
      } catch (e) {
        console.error('MapTiler reverse geocoding error:', e)
      }
    }

    // Fallback to Nominatim reverse geocoding
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        {
          headers: { 'User-Agent': 'MapLibreExplorer/1.0' },
          signal: controller.signal,
        }
      )
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          const name = data.name || data.address?.road || data.address?.city || data.address?.town || data.address?.village || data.display_name?.split(',')[0] || `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`
          const result = {
            name,
            fullName: data.display_name || name,
            latitude,
            longitude,
            type: data.type || 'place',
          }
          setCache(cacheKey, result)
          return NextResponse.json(result)
        }
      }
    } catch {
      // Nominatim failed, return coordinates
    }

    // Final fallback: just return coordinates
    const result = {
      name: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
      fullName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude,
      type: 'coordinates',
    }
    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return NextResponse.json(
      { error: 'Reverse geocoding failed' },
      { status: 500 }
    )
  }
}
