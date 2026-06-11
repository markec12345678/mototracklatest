import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for search results
type CacheEntry = { data: unknown; timestamp: number }
const searchCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 200

function getCached(key: string): unknown | null {
  const entry = searchCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: unknown) {
  // Evict old entries if cache is too large
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const oldest = [...searchCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < Math.floor(MAX_CACHE_SIZE / 4); i++) {
      searchCache.delete(oldest[i][0])
    }
  }
  searchCache.set(key, { data, timestamp: Date.now() })
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (response.ok) return response
      if (response.status === 429 || response.status === 503) {
        // Rate limited - wait and retry with backoff
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      return response
    } catch (err) {
      // Retry on timeout or network errors
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 500 + Math.random() * 300
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    // Reverse geocoding: if lat/lng provided without query, find place name
    if (!query && lat && lng) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
      }

      const cacheKey = `reverse:${latitude.toFixed(2)},${longitude.toFixed(2)}`
      const cached = getCached(cacheKey)
      if (cached) return NextResponse.json(cached)

      try {
        const response = await fetchWithRetry(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          { headers: { 'User-Agent': 'MapLibreExplorer/1.0' } }
        )

        if (response.ok) {
          const data = await response.json()
          const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name?.split(',')[0] || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
          const result = { name, fullName: data.display_name }
          setCache(cacheKey, result)
          return NextResponse.json(result)
        }
      } catch {
        // Fall through to coordinate display
      }

      return NextResponse.json({ name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` })
    }

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `search:${query.toLowerCase().trim()}`
    const cached = getCached(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Try Nominatim first, then fall back to Photon (Komoot)
    let data: unknown[] = []

    try {
      const response = await fetchWithRetry(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&dedupe=1`,
        {
          headers: {
            'User-Agent': 'MapLibreExplorer/1.0',
          },
        }
      )

      if (response.ok) {
        data = await response.json()
      }
    } catch {
      // Nominatim failed, try Photon fallback
    }

    // If Nominatim returned no results or failed, try Photon (Komoot) as fallback
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const photonResponse = await fetchWithRetry(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'User-Agent': 'MapLibreExplorer/1.0' } },
          1 // fewer retries for fallback
        )

        if (photonResponse.ok) {
          const photonData = await photonResponse.json()
          if (photonData.features && Array.isArray(photonData.features)) {
            data = photonData.features.map((f: Record<string, unknown>) => ({
              display_name: f.properties?.name ?
                `${f.properties.name}, ${f.properties.city || f.properties.state || f.properties.country || ''}`.replace(/,\s*$/, '') :
                String(f.properties?.name || ''),
              lat: f.geometry?.coordinates?.[1],
              lon: f.geometry?.coordinates?.[0],
              type: f.properties?.osm_value || 'place',
              category: f.properties?.osm_key || 'place',
            }))
          }
        }
      } catch {
        // Both services failed
      }
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'No results found. Geocoding services are temporarily unavailable.' },
        { status: 503 }
      )
    }

    // Deduplicate by display_name (some Nominatim results have exact duplicates)
    const seen = new Set<string>()
    const deduped = data.filter((item: Record<string, unknown>) => {
      const name = String(item.display_name)
      // Use first 50 chars as dedup key to catch near-duplicates
      const key = name.substring(0, 50).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 5) // Limit to 5 results after dedup

    const results = deduped.map((item: Record<string, unknown>) => ({
      name: item.display_name,
      latitude: parseFloat(String(item.lat)),
      longitude: parseFloat(String(item.lon)),
      type: item.type,
      category: item.category,
    }))

    setCache(cacheKey, results)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
